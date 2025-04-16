// Function to check if a tweet already has a rocket emoji
function hasRocketEmoji(element) {
  return element.querySelector('.rocket-emoji') !== null;
}

// Function to add rocket emoji to a tweet
function addRocketEmojiToTweet(tweet) {
  if (hasRocketEmoji(tweet)) return;

  const rocket = document.createElement('span');
  rocket.className = 'rocket-emoji';
  rocket.textContent = '🚀';
  rocket.style.cssText = `
    cursor: pointer;
    margin-left: 8px;
    font-size: 20px;
    position: absolute;
    z-index: 9999;
    top: 16px;
    right: 48px;
  `;
  
  rocket.addEventListener('click', async (event) => {
    // Prevent default navigation
    event.preventDefault();
    event.stopPropagation();
    
    // Get the tweet text - look for the actual content
    const tweetText = tweet.querySelector('p.text-textSecondary')?.textContent || '';
    
    // Get the tweet image - try multiple possible image types
    let tweetImage = tweet.querySelector('img[alt="Tweet media"]')?.src || 
                    tweet.querySelector('img[alt="Image"]')?.src ||
                    tweet.querySelector('img[alt="Profile banner"]')?.src ||
                    null;
    
    // If no text in main tweet, look for quoted tweet
    let finalText = tweetText;
    if (!finalText.trim()) {
        const quotedTweet = tweet.querySelector('div[class*="quoted-tweet"]');
        if (quotedTweet) {
            // Get text from quoted tweet
            const quotedText = quotedTweet.querySelector('p.text-textSecondary')?.textContent || '';
            
            // Try to get image from quoted tweet if we don't have one yet
            if (!tweetImage) {
                tweetImage = quotedTweet.querySelector('img[alt="Tweet media"]')?.src || 
                           quotedTweet.querySelector('img[alt="Image"]')?.src ||
                           quotedTweet.querySelector('img[alt="Profile banner"]')?.src ||
                           null;
            }
            
            // If quoted tweet has no text but has an image, use a descriptive placeholder
            if (!quotedText.trim() && tweetImage) {
                finalText = "[Image-only tweet]";
            } else {
                finalText = quotedText;
            }
        }
    }
    
    // Clean up the text
    finalText = finalText
        .replace(/^RT @[^:]+:\s*/, '') // Remove RT @username: prefix
        .replace(/@\w+/g, '') // Remove @mentions
        .trim();
    
    // If we have an image but no text, use a placeholder
    if (!finalText && tweetImage) {
        finalText = "[Image-only tweet]";
    }
    
    console.log('Tweet data being sent:', {
      text: finalText,
      image: tweetImage,
      originalText: tweetText,
      hasQuotedTweet: !!tweet.querySelector('div[class*="quoted-tweet"]'),
      isImageOnly: !finalText && !!tweetImage
    });
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeTweet',
        data: { text: finalText, image: tweetImage }
      });
      
      if (response.success) {
        console.log('Analysis successful:', response.data);
        // TODO: Show the result to the user
      } else {
        console.error('Analysis failed:', response.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });
  
  tweet.appendChild(rocket);
}

// Function to scan for tweets
function scanForTweets() {
  const tweets = document.querySelectorAll('div.border-b.border-primaryStroke:not(:has(.rocket-emoji)):has(a[href*="x.com"])');
  tweets.forEach(addRocketEmojiToTweet);
  return tweets.length;
}

// Initial setup
let isInitialScanComplete = false;
let scanInterval = null;

function startPeriodicScanning() {
  if (isInitialScanComplete) return;
  
  isInitialScanComplete = true;
  console.log('Initial scan complete, switching to periodic scanning...');
  
  // Clear any existing interval
  if (scanInterval) {
    clearInterval(scanInterval);
  }
  
  // Set up 30-second interval with a small random offset to prevent multiple tabs from scanning simultaneously
  const randomOffset = Math.floor(Math.random() * 5000); // Random offset up to 5 seconds
  setTimeout(() => {
    scanInterval = setInterval(() => {
      scanForTweets();
    }, 30000);
  }, randomOffset);
}

// Initial scan
const initialTweets = scanForTweets();

if (initialTweets === 0) {
  // If no tweets found initially, use a more efficient observer
  const observer = new MutationObserver((mutations) => {
    // Only process if we haven't completed initial scan
    if (!isInitialScanComplete) {
      const foundTweets = scanForTweets();
      if (foundTweets > 0) {
        startPeriodicScanning();
        observer.disconnect();
      }
    }
  });
  
  // Only observe the main content area to reduce overhead
  const mainContent = document.querySelector('main, [role="main"]') || document.body;
  observer.observe(mainContent, {
    childList: true,
    subtree: true
  });
} else {
  startPeriodicScanning();
}
