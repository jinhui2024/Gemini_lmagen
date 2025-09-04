<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Gemini 图像生成与编辑

一个简单易用的Web用户界面，用于体验和测试 Google 最新的 Imagen 图像生成模型和 Gemini 图像编辑模型。此应用允许用户通过简单的文本提示创建新图像，或上传现有图像进行智能编辑

## 使用方法：

1. 先打开你自己的 AI Studio 并登录；
2. 点击下方的 Demo 即可；
3. AIStudio每天对各模型有使用额度限制，自行查看Free层级对用的额度 [➡️ 额度限制](https://ai.google.dev/gemini-api/docs/rate-limits?hl=zh-cn)；
   

**[➡️ 在 AiStudio 中打开并运行此项目](https://ai.studio/apps/drive/1WWTTq-qwULDYWGtMvcsocZLrevOF9jVy)**

## ✨ 核心功能

- **多模型支持**:

  - **图像生成**: 集成了多个领先的 Imagen 模型，包括 Imagen 4.0, Imagen 4.0 Ultra, Imagen 4.0 Fast 和 Imagen 3.0。
  - **图像编辑**: 使用专门的 gemini-2.5-flash-image-preview (别名 "Nano Banana") 模型，对现有图像进行内容感知编辑。

- **动态自适应UI**:

  - 用户界面会根据所选模型智能调整。
  - 选择**生成模型**时，会显示“宽高比”和“批量大小”选项。

- **图像生成工作流**:

  - 输入详细的文本提示词来描述您想要的图像。
  - 可自定义图像的**宽高比**（方形、宽屏、竖向等）。
  - 可选择一次生成**最多4张**图像（Ultra 模型固定为1张）。

- **图像编辑工作流**:

  - 适用于gemini-2.5-flash-image-preview (别名 "Nano Banana") 模型

  - 一次性**上传最多5张**本地图片作为编辑基础。
  - 在预览区域可以立即看到已上传的图片。
  - 输入编辑指令（例如，“给这个人戴上太阳镜”或“把背景换成海滩”），AI 将理解并修改图像。

## 📝 如何使用

#### 生成新图像:

1. 从“选择模型”下拉菜单中选择一个 Imagen 模型 (例如, Imagen 4.0)。
2. 在文本框中输入详细的图像描述 (Prompt)。
3. 根据需要选择“宽高比”和“批量大小”。
4. 点击 **“生成图像”** 按钮，等待结果出现在下方画廊中。

#### 编辑现有图像:

1. 从“选择模型”下拉菜单中选择 Nano Banana (编辑)。
2. 点击 **“上传图像”** 按钮，选择1到5张本地图片。
3. 在文本框中输入您的编辑指令 (例如，“把图2的玩具，让图1的小男孩用左手拿起来”)。
4. 点击 **“生成图像”** 按钮，处理后的新图像将会显示出来。

**AI 模型：通过 @google/genai SDK 的 gemini-2.5-flash-image-preview，Imagen 4.0, Imagen 4.0 Ultra, Imagen 4.0 Fast 和 Imagen 3.0。**

**样    式： HTML5, CSS3, TypeScript**

**环    境：本设计是让大家直接在 Google AI Studio 中运行，无需在本地配置环境。**
