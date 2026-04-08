// Popup script for Codeforces Focus Mode Extension

// Storage keys
const STORAGE_KEYS = {
  materials: 'cf_focus_materials_visible',
  submit: 'cf_focus_submit_visible',
  contestNavHidden: 'cf_focus_contest_nav_hidden',  // Inverted: default is visible
  focusEnabled: 'cf_focus_enabled'
};

// Current settings
let settings = {
  materialsVisible: false,
  submitVisible: false,
  contestNavHidden: false,  // Default: contest nav is visible
  focusEnabled: true
};

document.addEventListener('DOMContentLoaded', async () => {
  const focusToggle = document.getElementById('focusToggle');
  const materialsToggle = document.getElementById('materialsToggle');
  const submitToggle = document.getElementById('submitToggle');
  const contestNavToggle = document.getElementById('contestNavToggle');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  
  // Load current settings
  await loadSettings();
  
  // Update UI
  focusToggle.checked = settings.focusEnabled;
  materialsToggle.checked = settings.materialsVisible;
  submitToggle.checked = settings.submitVisible;
  contestNavToggle.checked = settings.contestNavHidden;  // Inverted: checked = hidden
  updateStatusUI();
  
  // Handle Focus Mode toggle
  focusToggle.addEventListener('change', async () => {
    settings.focusEnabled = focusToggle.checked;
    await saveSetting(STORAGE_KEYS.focusEnabled, settings.focusEnabled);
    updateStatusUI();
    sendMessageToTabs({ 
      action: 'toggleFocus', 
      enabled: settings.focusEnabled 
    });
  });
  
  // Handle Materials toggle
  materialsToggle.addEventListener('change', async () => {
    settings.materialsVisible = materialsToggle.checked;
    await saveSetting(STORAGE_KEYS.materials, settings.materialsVisible);
    sendSettingsToTabs();
  });
  
  // Handle Submit toggle
  submitToggle.addEventListener('change', async () => {
    settings.submitVisible = submitToggle.checked;
    await saveSetting(STORAGE_KEYS.submit, settings.submitVisible);
    sendSettingsToTabs();
  });
  
  // Handle Contest Nav toggle (inverted: checked = hidden)
  contestNavToggle.addEventListener('change', async () => {
    settings.contestNavHidden = contestNavToggle.checked;
    await saveSetting(STORAGE_KEYS.contestNavHidden, settings.contestNavHidden);
    sendSettingsToTabs();
  });
  
  function updateStatusUI() {
    if (settings.focusEnabled) {
      statusDot.classList.remove('inactive');
      statusText.textContent = 'Active on Codeforces';
    } else {
      statusDot.classList.add('inactive');
      statusText.textContent = 'Focus Mode Disabled';
    }
  }
});

// Load settings from storage
async function loadSettings() {
  try {
    let result;
    if (typeof browser !== 'undefined') {
      result = await browser.storage.local.get([
        STORAGE_KEYS.materials,
        STORAGE_KEYS.submit,
        STORAGE_KEYS.contestNavHidden,
        STORAGE_KEYS.focusEnabled
      ]);
    } else if (typeof chrome !== 'undefined') {
      result = await chrome.storage.local.get([
        STORAGE_KEYS.materials,
        STORAGE_KEYS.submit,
        STORAGE_KEYS.contestNavHidden,
        STORAGE_KEYS.focusEnabled
      ]);
    }
    
    settings.materialsVisible = result[STORAGE_KEYS.materials] === true;
    settings.submitVisible = result[STORAGE_KEYS.submit] === true;
    settings.contestNavHidden = result[STORAGE_KEYS.contestNavHidden] === true;
    settings.focusEnabled = result[STORAGE_KEYS.focusEnabled] !== false;
  } catch (e) {
    console.log('Could not load settings:', e);
  }
}

// Save setting to storage
async function saveSetting(key, value) {
  try {
    if (typeof browser !== 'undefined') {
      await browser.storage.local.set({ [key]: value });
    } else if (typeof chrome !== 'undefined') {
      await chrome.storage.local.set({ [key]: value });
    }
  } catch (e) {
    console.log('Could not save setting:', e);
  }
}

// Send settings update to all Codeforces tabs
function sendSettingsToTabs() {
  sendMessageToTabs({
    action: 'updateSettings',
    materialsVisible: settings.materialsVisible,
    submitVisible: settings.submitVisible,
    contestNavHidden: settings.contestNavHidden
  });
}

// Send message to all Codeforces tabs
async function sendMessageToTabs(message) {
  try {
    let tabs;
    if (typeof browser !== 'undefined') {
      tabs = await browser.tabs.query({ url: '*://codeforces.com/*' });
      for (const tab of tabs) {
        browser.tabs.sendMessage(tab.id, message).catch(() => {});
      }
    } else if (typeof chrome !== 'undefined') {
      tabs = await chrome.tabs.query({ url: '*://codeforces.com/*' });
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, message, () => {
          if (chrome.runtime.lastError) {
            // Tab might not have content script loaded
          }
        });
      }
    }
  } catch (e) {
    console.log('Could not send message:', e);
  }
}