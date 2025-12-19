# Audio Setup Instructions

## How to Add Your Background Music

To add the background music from the YouTube video to this prototype, follow these steps:

### Option 1: Download from YouTube (Recommended)

1. **Use a YouTube to MP3 converter** (make sure it's legal in your jurisdiction):
   - Visit a service like: https://ytmp3.nu/ or similar
   - Paste your YouTube URL: https://www.youtube.com/watch?v=PrSXb44xu0s
   - Download the audio as MP3

2. **Rename and place the file:**
   - Rename the downloaded file to: `background-music.mp3`
   - Place it in this `audio` folder
   - The file path should be: `audio/background-music.mp3`

3. **Refresh your browser** (Ctrl+Shift+R / Cmd+Shift+R)

### Option 2: Use a Different Format

If you have the audio in a different format (WAV, OGG, etc.), you can either:
- Convert it to MP3 using a tool like Audacity or online converters
- Or update `index.html` line 20 to reference your file format:
  ```html
  <source src="audio/background-music.wav" type="audio/wav">
  ```

### Music Controls

Once the audio file is in place, you can:
- **Toggle music ON/OFF** using the 🎵 button in the bottom-right settings panel
- **Volume** is set to 30% by default (can be adjusted in `js/main.js` line 41)

### Important Notes

- The audio file is **not included** in this repository due to copyright
- Make sure you have the rights to use any audio you add
- The music will loop continuously while the experience is running
- If autoplay is blocked by your browser, you can manually enable it using the music button

### Troubleshooting

**Music doesn't play:**
- Check that the file is named exactly `background-music.mp3`
- Verify it's in the `audio` folder at the root of the project
- Check browser console (F12) for any error messages
- Try clicking the music toggle button to manually start playback

**File not found error:**
- Make sure the file path matches: `audio/background-music.mp3`
- Check file permissions (should be readable)
