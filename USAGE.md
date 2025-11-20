# Lumina AI Video Editor - Usage Guide

## Getting Started

### 1. Set Up Your Google AI API Key

Before using any AI features, you need to configure your Google AI API key:

1. Get your API key from: https://aistudio.google.com/apikey
2. Click **"Connect Google AI"** button in the header
3. Enter your API key when prompted
4. The key will be stored locally in your browser

### 2. Using AI Tools

The left sidebar contains 9 AI-powered tools:

#### **Generate Video**
- Creates AI videos from text prompts or images
- Upload an image (optional) and enter a prompt
- Select aspect ratio (1:1, 16:9, 9:16, 4:3)
- Click Generate and wait (video generation takes 30-60 seconds)

#### **Generate Image**
- Creates images from text descriptions
- Enter your prompt
- Select aspect ratio
- Click Generate

#### **Remove Background**
- Removes backgrounds from images
- Upload an image
- Click Generate (uses default prompt)
- Creates transparent background

#### **Replace Background**
- Swaps image backgrounds
- Upload an image
- Enter description of new background
- Click Generate

#### **Enhance Photo**
- Upscales and improves image quality
- Upload an image
- Click Generate

#### **Colorize**
- Adds color to black & white photos
- Upload a B&W image
- Click Generate

#### **Cartoonify**
- Transforms photos into cartoon style
- Upload an image
- Click Generate

#### **Text to Speech**
- Generates AI voiceovers
- Enter your text
- Click Generate (audio plays immediately)

#### **Record Webcam**
- Records video from your camera
- Click to allow camera access
- Click again to start/stop recording

### 3. Working with the Timeline

After generating content:

1. Click **"Add to Timeline"** to add it to your video
2. Clips appear in the timeline at the bottom
3. Video clips go on Track 1
4. Image overlays go on Track 2
5. Use the Remotion Player preview to see your composition

### 4. Preview & Playback

- The center preview window shows your video composition
- Built-in playback controls (play, pause, seek)
- Overlays fade in/out automatically
- All clips render in real-time

### 5. Tips

- **API Key Issues**: If features don't work, check you've set up your API key
- **Video Generation**: Be patient - AI video generation takes time
- **Error Messages**: Read error messages carefully - they guide you on what's needed
- **Image Uploads**: Required for editing tools (background removal, enhancement, etc.)
- **Prompts**: More detailed prompts give better results

## Troubleshooting

**"Please configure your Google AI API key"**
- Click the "Connect Google AI" button in the header and enter your key

**"Please upload an image first"**
- The selected tool requires an image - click the upload area

**"Please enter text for speech generation"**
- Text-to-speech requires text input - fill in the prompt field

**Features not responding**
- Check browser console for errors
- Verify API key is configured
- Ensure you have internet connection
- Try refreshing the page

## Advanced

### Using Remotion Studio (Optional)

To access the full Remotion editor for advanced composition:

```bash
npx remotion studio remotion/index.ts
```

This opens a professional video editing interface where you can:
- Fine-tune compositions
- Export videos to file
- Add custom effects
- Adjust timing precisely
