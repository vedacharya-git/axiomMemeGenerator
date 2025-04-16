// Saves options to chrome.storage
function saveOptions() {
  const serverUrl = document.getElementById('serverUrl').value;
  chrome.storage.sync.set(
    {
      serverUrl: serverUrl,
    },
    function() {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      status.className = 'status success';
      status.style.display = 'block';
      setTimeout(function() {
        status.style.display = 'none';
      }, 2000);
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  chrome.storage.sync.get(
    {
      serverUrl: 'http://localhost:3000', // default value
    },
    function(items) {
      document.getElementById('serverUrl').value = items.serverUrl;
    }
  );
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions); 