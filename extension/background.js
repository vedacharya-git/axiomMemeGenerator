// Default server URL - users can change this in extension options
let BACKEND_URL = 'http://localhost:3000';

// Load saved server URL if it exists
chrome.storage.sync.get(['serverUrl'], function(result) {
  if (result.serverUrl) {
    BACKEND_URL = result.serverUrl;
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzeTweet') {
    handleTweetAnalysis(message.data)
      .then(response => {
        console.log('Analysis Response:', response);
        sendResponse({ success: true, data: response });
      })
      .catch(error => {
        console.error('Error analyzing tweet:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required for async response
  }
});

async function handleTweetAnalysis(tweetData) {
  const { text, image } = tweetData;
  
  try {
    const response = await fetch(`${BACKEND_URL}/analyze-tweet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, image })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Analysis failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in handleTweetAnalysis:', error);
    throw error;
  }
}