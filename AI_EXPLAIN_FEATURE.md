# AI Explain Feature 🤖📸

This document describes the AI-powered screenshot explanation feature added to Project Reach.

## Overview

The AI Explain feature allows users to capture screenshots of any screen in the app and get intelligent explanations of what they're seeing. This is particularly useful for:

- Parents who want to understand the app's functionality
- Students who need guidance on how to use different features
- Educational content explanation and navigation help

## How It Works

### Frontend (React Native)
1. **ExplainButton Component**: A floating button in the lower right corner of each screen
2. **Screenshot Capture**: Uses `react-native-view-shot` to capture the current screen
3. **API Integration**: Sends the screenshot to the backend AI service
4. **Result Display**: Shows the AI explanation in an alert dialog

### Backend (FastAPI + Qwen2.5-VL)
1. **AI Service**: `/api/v1/ai/explain-screenshot` endpoint
2. **Model**: Qwen2.5-VL-7B-Instruct for vision-language understanding
3. **Processing**: Converts base64 images and generates contextual explanations

## Installation

### Quick Setup
Run the setup script for your platform:

**Windows:**
```bash
setup-ai-feature.bat
```

**Linux/macOS:**
```bash
./setup-ai-feature.sh
```

### Manual Installation

#### Frontend Dependencies
```bash
cd my-rn-app
npm install react-native-view-shot@4.0.0-alpha.2 expo-media-library@17.0.3 expo-sharing@13.0.2
```

#### Backend Dependencies
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate.bat
pip install huggingface-hub>=0.20.0
```

#### Environment Setup
Add your Hugging Face token to `backend/.env`:
```env
HF_TOKEN=your_hugging_face_token_here
```

Get your token from: https://huggingface.co/settings/tokens

## Usage

1. **Navigate to any screen** in the app (Home, Learn, Community, Games, Analytics, Tokens)
2. **Look for the Explain button** in the lower right corner (purple button with ❓ icon)
3. **Tap the button** to capture a screenshot and get automatic description
4. **Wait for processing** (loading indicator will show)
5. **Read the AI description** in the popup dialog

**Note:** The AI automatically describes everything it sees - no user input required!

## Technical Details

### Frontend Components

#### ExplainButton.tsx
- Floating action button with purple background (#8b5cf6)
- Uses `captureRef` to screenshot the entire screen
- Shows loading state during processing
- Positioned absolutely in the lower right corner

#### PageWrapper.tsx
- Wrapper component that adds ExplainButton to any page
- Manages screenshot ref for the wrapped content
- Used by all main app screens

### Backend Architecture

#### AI Service (`services/ai/service.py`)
- `QwenVLService` class using Hugging Face Inference API
- Handles base64 to data URL conversion
- Calls Qwen2.5-VL via cloud API
- Generates educational-focused explanations

#### AI Router (`services/ai/router.py`)
- POST `/api/v1/ai/explain-screenshot` endpoint
- Requires authentication
- Validates image data
- Returns structured explanation response

### Model Details

**Qwen2.5-VL-7B-Instruct via Hugging Face Inference API**
- 7 billion parameter vision-language model
- Hosted on Hugging Face's cloud infrastructure
- No local downloads required
- Instant responses via API calls

### Fixed Prompt
```
Describe the image and text within in detail
```

## Configuration

### Changing the Prompt
To change the fixed prompt, modify it in `backend/services/ai/service.py`:

```python
# Fixed prompt for image description
prompt = "Describe the image and text within in detail"
```

### API Settings
Adjust API parameters in `backend/services/ai/service.py`:

```python
completion = self.client.chat.completions.create(
    model="Qwen/Qwen2.5-VL-7B-Instruct",
    messages=messages,
    max_tokens=512,  # Adjust response length
    temperature=0.7  # Adjust creativity (0.0-1.0)
)
```

## Troubleshooting

### Common Issues

1. **"Cannot find module 'react-native-view-shot'"**
   - Solution: Run `npm install` in the `my-rn-app` directory

2. **"HF_TOKEN environment variable is required"**
   - Solution: Get token from https://huggingface.co/settings/tokens and add to `.env` file

3. **"Failed to initialize Hugging Face client"**
   - Solution: Check your HF_TOKEN is valid and has appropriate permissions

4. **API rate limiting errors**
   - Solution: Upgrade your Hugging Face account or wait for rate limits to reset

### Performance Optimization

1. **API Responses**: Typically 1-3 seconds response time
2. **Image Compression**: Screenshots are captured at 80% quality to reduce transfer time
3. **Token Management**: Use HF Pro for higher rate limits and faster responses

## Security Considerations

1. **Authentication Required**: All AI endpoints require user authentication
2. **No Image Storage**: Screenshots are processed in memory only
3. **Rate Limiting**: Consider adding rate limits for production use

## Future Enhancements

- [ ] Voice narration of explanations
- [ ] Multi-language support
- [ ] Contextual explanations based on user role (parent vs student)
- [ ] Screenshot history and saved explanations
- [ ] Integration with help documentation

## Support

For issues or questions about the AI Explain feature:
1. Check the troubleshooting section above
2. Review logs in backend console for error details
3. Ensure all dependencies are properly installed
