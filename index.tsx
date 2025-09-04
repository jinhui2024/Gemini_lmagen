/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {GoogleGenAI, GeneratedImage, Modality} from '@google/genai';

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

// --- DOM Elements ---
const modelSelector = document.getElementById('model-selector') as HTMLSelectElement;
const imageGallery = document.getElementById('image-gallery');
const promptInput = document.getElementById('prompt-input') as HTMLTextAreaElement;
const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
const editControls = document.getElementById('edit-controls');
const imageUpload = document.getElementById('image-upload') as HTMLInputElement;
const imagePreviewContainer = document.getElementById('image-preview-container');
const aspectRatioContainer = document.getElementById('aspect-ratio-container');
const aspectRatioSelector = document.getElementById('aspect-ratio-selector') as HTMLSelectElement;
const batchSizeContainer = document.getElementById('batch-size-container');
const batchSizeSelector = document.getElementById('batch-size-selector') as HTMLSelectElement;
const lightboxOverlay = document.getElementById('lightbox-overlay') as HTMLDivElement;
const lightboxImage = document.getElementById('lightbox-image') as HTMLImageElement;
const lightboxClose = document.getElementById('lightbox-close') as HTMLSpanElement;


// --- App State ---
let uploadedImageData: {
    base64: string;
    mimeType: string;
}[] = [];

const NANO_BANANA_MODEL = 'gemini-2.5-flash-image-preview';
const IMAGEN_ULTRA_MODEL = 'imagen-4.0-ultra-generate-001';

// --- UI Helper Functions ---

function showStatus(message: string, isError = false) {
    if (imageGallery) {
        imageGallery.innerHTML = `<p class="status-message" style="color: ${isError ? 'red' : 'inherit'};">${message}</p>`;
    }
}

function setLoading(isLoading: boolean) {
    generateBtn.disabled = isLoading;
    if (isLoading) {
        showStatus('Generating...');
    }
}

function handleModelChange() {
    const selectedModel = modelSelector.value;
    const isNanoBanana = selectedModel === NANO_BANANA_MODEL;
    const isUltra = selectedModel === IMAGEN_ULTRA_MODEL;

    editControls?.classList.toggle('hidden', !isNanoBanana);
    aspectRatioContainer?.classList.toggle('hidden', isNanoBanana);
    batchSizeContainer?.classList.toggle('hidden', isNanoBanana);

    if (isUltra) {
        batchSizeSelector.value = '1';
        batchSizeSelector.disabled = true;
    } else {
        batchSizeSelector.disabled = false;
    }

    if (!isNanoBanana) {
        // Clear image selection if switching away from edit model
        imageUpload.value = '';
        imagePreviewContainer!.innerHTML = '';
        uploadedImageData = [];
    }
}

async function handleImageUpload(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) {
        uploadedImageData = [];
        imagePreviewContainer!.innerHTML = '';
        return;
    }

    if (files.length > 5) {
        alert('You can only upload a maximum of 5 images. Taking the first 5.');
    }

    const filesToProcess = Array.from(files).slice(0, 5);
    uploadedImageData = []; // Clear previous uploads
    imagePreviewContainer!.innerHTML = ''; // Clear previous previews

    const readPromises = filesToProcess.map(file => {
        return new Promise<{ base64: string; mimeType: string; dataUrl: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                const base64String = dataUrl.split(',')[1];
                resolve({
                    base64: base64String,
                    mimeType: file.type,
                    dataUrl: dataUrl
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    });

    try {
        const results = await Promise.all(readPromises);
        results.forEach(result => {
            uploadedImageData.push({ base64: result.base64, mimeType: result.mimeType });
            const img = document.createElement('img');
            img.src = result.dataUrl;
            img.alt = 'Image preview';
            imagePreviewContainer!.appendChild(img);
        });
    } catch (error) {
        console.error('Error reading files:', error);
        showStatus('Error reading uploaded files.', true);
    }
}

function createImageContainer(src: string, prompt: string, index: number, mimeType: string = 'image/jpeg') {
    const container = document.createElement('div');
    container.className = 'image-container';

    const img = new Image();
    img.src = src;
    img.alt = `${prompt} - Image ${index + 1}`;
    img.onclick = () => openLightbox(src); // Open lightbox on image click

    const downloadLink = document.createElement('a');
    downloadLink.href = src;
    const extension = mimeType.split('/')[1] || 'jpeg';
    downloadLink.download = `generated-${prompt.substring(0, 20).replace(/\s/g, '_')}-${index + 1}.${extension}`;
    downloadLink.className = 'download-btn';
    downloadLink.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>`;
    downloadLink.setAttribute('aria-label', 'Download image');

    container.appendChild(img);
    container.appendChild(downloadLink);

    return container;
}

// --- Lightbox Functions ---
function openLightbox(src: string) {
    if (lightboxImage && lightboxOverlay) {
        lightboxImage.src = src;
        lightboxOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
    }
}

function closeLightbox() {
    if (lightboxOverlay) {
        lightboxOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}


// --- Generation Functions ---

async function generateWithImagen(model: string, prompt: string) {
    setLoading(true);
    try {
        const isUltra = model === IMAGEN_ULTRA_MODEL;
        const numberOfImages = isUltra ? 1 : parseInt(batchSizeSelector.value, 10);
        const aspectRatio = aspectRatioSelector.value;

        const response = await ai.models.generateImages({
            model: model,
            prompt: prompt,
            config: {
                numberOfImages: numberOfImages,
                aspectRatio: aspectRatio,
                outputMimeType: 'image/jpeg',
            },
        });
        
        if (imageGallery && response?.generatedImages) {
            imageGallery.innerHTML = ''; // Clear previous images/loading message
            response.generatedImages.forEach((generatedImage: GeneratedImage, index: number) => {
                if (generatedImage.image?.imageBytes) {
                    const src = `data:image/jpeg;base64,${generatedImage.image.imageBytes}`;
                    const imageElement = createImageContainer(src, prompt, index);
                    imageGallery.appendChild(imageElement);
                }
            });
        }
    } catch (error) {
        console.error("Error generating images with Imagen:", error);
        showStatus('Error: Could not generate images. Check the console.', true);
    } finally {
        setLoading(false);
    }
}

async function generateWithNanoBanana(prompt: string) {
    if (uploadedImageData.length === 0) {
        showStatus('Please upload at least one image to edit.', true);
        return;
    }

    setLoading(true);
    try {
        const imageParts = uploadedImageData.map(imageData => ({
            inlineData: {
                data: imageData.base64,
                mimeType: imageData.mimeType,
            },
        }));

        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: NANO_BANANA_MODEL,
            contents: {
                parts: [...imageParts, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (imageGallery) {
            imageGallery.innerHTML = '';
            let imageFound = false;
            let imageIndex = 0;
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageFound = true;
                    const base64ImageBytes: string = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType;
                    const imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
                    const imageElement = createImageContainer(imageUrl, `edited-${prompt}`, imageIndex++, mimeType);
                    imageGallery.appendChild(imageElement);
                }
            }
            if (!imageFound) {
                showStatus('The model did not return an image. It might have responded with text only.', true);
                console.log('Model Response:', response.text);
            }
        }

    } catch (error) {
        console.error("Error editing image with Nano Banana:", error);
        showStatus('Error: Could not edit the image. Check the console.', true);
    } finally {
        setLoading(false);
    }
}

async function handleGenerateClick() {
    if (!promptInput || !modelSelector) return;
    const prompt = promptInput.value;
    if (!prompt) {
        showStatus('Please enter a prompt.', true);
        return;
    }

    const selectedModel = modelSelector.value;

    if (selectedModel === NANO_BANANA_MODEL) {
        await generateWithNanoBanana(prompt);
    } else {
        await generateWithImagen(selectedModel, prompt);
    }
}

// --- Event Listeners ---
modelSelector.addEventListener('change', handleModelChange);
generateBtn.addEventListener('click', handleGenerateClick);
imageUpload.addEventListener('change', handleImageUpload);

lightboxClose.addEventListener('click', closeLightbox);
lightboxOverlay.addEventListener('click', (e) => {
    // Only close if the click is on the overlay itself, not the image
    if (e.target === lightboxOverlay) {
        closeLightbox();
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightboxOverlay.classList.contains('hidden')) {
        closeLightbox();
    }
});

// --- Initial Setup ---
handleModelChange(); // Set initial UI state
promptInput.value = 'Editorial wildlife photograph: a sleek black panther standing regally on a reflective salt flat at dusk, wearing a dramatic, sculptural couture gown inspired by organic forms. The landscape is vast and otherworldly but grounded in reality, with subtle shimmering textures and a warm, golden-hour glow.';