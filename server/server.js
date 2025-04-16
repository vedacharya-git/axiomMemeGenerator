const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Check for API key
if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set in .env file');
  process.exit(1);
}

app.post('/analyze-tweet', async (req, res) => {
  try {
    const { text, image } = req.body;
    
    console.log('Received request data:', {
      text,
      image,
      requestBody: req.body
    });
    
    // Allow empty text if we have an image
    if (!text && !image) {
      throw new Error('No content provided (neither text nor image)');
    }
    
    // Prepare the prompt
    const prompt = `Analyze this X Post's content and generate a creative, funny, and catchy meme token name and ticker symbol.

Content to analyze:
${text || '[Image-only post]'}
${image ? `Image URL: ${image}` : ''}

Generate a creative, funny, and catchy meme token name and a corresponding ticker symbol based on the content. Be witty and capture the essence of the post.

Constraints:
- Token Name: Prioritize creative and memeable names that are 1 or 2 words long, but allow up to 4 words if necessary. Avoid just copying long phrases.
- Token Ticker:
    - Priority: Aim for tickers that are 1 or 2 words long, matching the name when possible.
    - Rule 1: If the Token Name is 1 or 2 words long, the ticker MUST be the same as the Token Name (e.g., Name: 'Whale Alert' -> Ticker: Whale Alert; Name: 'Meltdown' -> Ticker: Meltdown).
    - Rule 2: If the Token Name is 3 or 4 words long, the ticker MUST be the first letter of each word (e.g., Name: 'Super Whale Withdraw' -> Ticker: SWW).
- Output Format: Respond ONLY with the following structure, nothing else:

Token Name: [Generated Name]
Token Ticker: [Generated Ticker]`;
    
    console.log('Sending request to Gemini API...');
    
    // Make the API request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const analysis = data.candidates[0].content.parts[0].text;
    
    console.log('Received response from Gemini:\n', analysis);
    
    // Parse the response to extract token name and ticker
    const tokenNameMatch = analysis.match(/Token Name: (.*)/);
    const tokenTickerMatch = analysis.match(/Token Ticker: (.*)/);
    
    if (!tokenNameMatch || !tokenTickerMatch) {
      throw new Error('Invalid response format from Gemini');
    }
    
    const tokenName = tokenNameMatch[1].trim();
    const tokenTicker = tokenTickerMatch[1].trim();
    
    res.json({ 
      success: true, 
      data: {
        tokenName,
        tokenTicker
      }
    });
  } catch (error) {
    console.error('Error analyzing tweet:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 