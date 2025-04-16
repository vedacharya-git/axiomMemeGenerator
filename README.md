# Axiom Trade Meme Token Generator

A Chrome extension that enhances Axiom Trade by adding a rocket emoji (🚀) to tweets, which when clicked, generates creative meme token names and tickers using Google's Gemini AI.

## Features

- 🚀 Adds interactive rocket emojis to tweets on axiom.trade
- 🤖 Uses Gemini AI to generate creative meme token names
- ⚡ Real-time token name generation
- 🎨 Seamless integration with Axiom Trade's interface

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm
- Chrome browser
- Google Cloud Platform account (for Gemini API)

### Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the server:
   ```bash
   node server.js
   ```

### Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `extension` directory
4. The extension icon should appear in your Chrome toolbar

## Development

### Project Structure

```
├── extension/
│   ├── manifest.json
│   ├── content.js
│   ├── background.js
│   ├── options.html
│   ├── options.js
│   └── styles.css
└── server/
    ├── server.js
    ├── package.json
    ├── package-lock.json
    └── .env
```

### Server
- Built with Express.js
- Uses Google's Gemini AI for token name generation
- Handles API requests from the Chrome extension

### Extension
- Content script injects rocket emojis into tweets
- Background script manages communication with the server
- Options page for future customization features

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

MIT License - Feel free to use and modify as needed.

## Security

- Never commit your `.env` file
- Keep your API keys secure
- Regularly update dependencies