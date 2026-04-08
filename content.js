(function() {
  'use strict';

  // Storage keys
  const STORAGE_KEYS = {
    materials: 'cf_focus_materials_visible',
    submit: 'cf_focus_submit_visible',
    contestNavHidden: 'cf_focus_contest_nav_hidden',  // Inverted: default is visible
    focusEnabled: 'cf_focus_enabled'
  };

  // Track state
  let isInitialized = false;
  let settings = {
    materialsVisible: false,
    submitVisible: false,
    contestNavHidden: false,  // Inverted: false = visible (default), true = hidden
    focusEnabled: true
  };

  // Initialize extension
  async function init() {
    if (isInitialized) return;
    isInitialized = true;

    // Load all settings
    await loadSettings();

    if (!settings.focusEnabled) return;

    // Apply focus mode
    applyFocusMode();
    
    // Watch for dynamic content changes
    observeChanges();
  }

  // Load all settings from storage
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
      // Use defaults
      settings = { 
        materialsVisible: false, 
        submitVisible: false, 
        contestNavHidden: false,  // Default: contest nav is visible
        focusEnabled: true 
      };
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
      console.log('Codeforces Focus: Could not save setting');
    }
  }

  // Apply focus mode styles based on settings
  function applyFocusMode() {
    document.body.classList.add('cf-focus-mode');
    
    // Apply visibility classes
    if (settings.materialsVisible) {
      document.body.classList.add('cf-show-materials');
    } else {
      document.body.classList.remove('cf-show-materials');
    }
    
    if (settings.submitVisible) {
      document.body.classList.add('cf-show-submit');
    } else {
      document.body.classList.remove('cf-show-submit');
    }

    // Contest nav: if hidden is true, add hide class
    if (settings.contestNavHidden) {
      document.body.classList.add('cf-hide-contest-nav');
    } else {
      document.body.classList.remove('cf-hide-contest-nav');
    }

    // Hide elements
    hideElements();
  }

  // Hide all distracting elements
  function hideElements() {
    // Hide navbar (main site header)
    hideBySelector('#header');
    hideBySelector('.header');
    hideBySelector('.roundbox.menu-box');
    
    // Hide logo
    hideBySelector('#header .logo');
    hideBySelector('.logo-codeforces');
    
    // Hide footer
    hideBySelector('#footer');
    hideBySelector('.footer');
    hideBySelector('.roundbox:has(.copyright)');
    
    // Hide right sidebar on problem pages
    hideSidebarElements();
    
    // Hide main site navigation menu (NOT contest navigation)
    hideBySelector('.menu-list');
    hideBySelector('.menu');
    hideBySelector('#menu');
    hideBySelector('.top-menu');
    // Note: .second-level-menu is the contest navigation - keep it visible!
    
    // Hide contest navigation only if explicitly disabled
    hideContestNavigation();
  }

  // Hide contest navigation tabs (only if user chooses to hide)
  function hideContestNavigation() {
    // Default: contest nav is visible (contestNavHidden = false)
    // Only hide if user explicitly toggles "Hide Contest Nav"
    if (!settings.contestNavHidden) return;
    
    // Common selectors for contest navigation
    const navSelectors = [
      '.second-level-menu',  // Common container for contest tabs
      '.contest-nav',
      '.contest-menu',
      '#contest-nav',
      '.roundbox:has(a[href*="/problem/"]):has(a[href*="/submit"])',
      '.roundbox:has(a[href*="/status"]):has(a[href*="/standings"])'
    ];
    
    navSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        // Check if this contains contest navigation links
        const links = el.querySelectorAll('a');
        let isContestNav = false;
        
        links.forEach(link => {
          const href = link.getAttribute('href') || '';
          const text = link.textContent.toLowerCase();
          
          if (text.includes('problems') || text.includes('submit') || 
              text.includes('status') || text.includes('standings') || 
              text.includes('custom test') || text.includes('custom invocation') ||
              href.includes('/problem/') || href.includes('/submit') ||
              href.includes('/status') || href.includes('/standings') ||
              href.includes('/customtest') || href.includes('/custom')) {
            isContestNav = true;
          }
        });
        
        if (isContestNav || links.length >= 3) {
          el.classList.add('cf-hidden-element');
        }
      });
    });
    
    // Also hide individual contest nav links if not in a container
    const contestLinks = document.querySelectorAll('a');
    contestLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      const text = link.textContent.toLowerCase().trim();
      
      if ((text === 'problems' || text === 'submit' || text === 'status' || 
           text === 'standings' || text === 'custom test' || text === 'custom invocation' ||
           href.includes('/problem/') || href.includes('/submit') ||
           href.includes('/status') || href.includes('/standings')) &&
          !link.closest('.problem-statement')) {
        // Find parent container
        let parent = link.parentElement;
        while (parent && parent !== document.body) {
          if (parent.querySelectorAll('a').length >= 3) {
            parent.classList.add('cf-hidden-element');
            break;
          }
          parent = parent.parentElement;
        }
      }
    });
  }

  // Hide sidebar elements - respecting settings
  function hideSidebarElements() {
    // Find all sideboxes
    const sideboxes = document.querySelectorAll('.roundbox.sidebox, .sidebox');
    
    sideboxes.forEach(box => {
      const caption = box.querySelector('.caption, .titled');
      const links = box.querySelectorAll('a');
      let shouldHide = false;
      let isMaterials = false;
      let isSubmit = false;
      
      if (caption) {
        const text = caption.textContent.toLowerCase();
        
        // Hide contest name box (not materials)
        if (text.includes('contest') && !text.includes('materials')) {
          shouldHide = true;
        }
        
        // Check if this is materials box
        if (text.includes('materials') || text.includes('contest materials')) {
          isMaterials = true;
          shouldHide = !settings.materialsVisible;
        }
      }
      
      // Check for specific links
      links.forEach(link => {
        const href = link.getAttribute('href') || '';
        const text = link.textContent.toLowerCase();
        
        // Hide virtual participation
        if (href.includes('virtual') || text.includes('virtual')) {
          box.classList.add('cf-hidden-element');
        }
        
        // Hide clone to mashup
        if (href.includes('mashup') || text.includes('mashup') || text.includes('clone')) {
          box.classList.add('cf-hidden-element');
        }
        
        // Check for submit
        if (href.includes('submit') || text.includes('submit') || link.classList.contains('submit')) {
          isSubmit = true;
          if (!settings.submitVisible) {
            box.classList.add('cf-hidden-element');
          } else {
            box.classList.remove('cf-hidden-element');
          }
        }
      });
      
      // Apply hide for non-submit, non-materials boxes
      if (shouldHide && !isSubmit) {
        box.classList.add('cf-hidden-element');
      } else if (isMaterials && settings.materialsVisible) {
        box.classList.remove('cf-hidden-element');
      }
    });

    // Handle standalone submit buttons
    const submitButtons = document.querySelectorAll('.submit, input[type="submit"], button.submit');
    submitButtons.forEach(btn => {
      if (!btn.closest('.problem-statement')) {
        if (!settings.submitVisible) {
          btn.classList.add('cf-hidden-element');
        } else {
          btn.classList.remove('cf-hidden-element');
        }
      }
    });
  }

  // Helper to hide elements by selector
  function hideBySelector(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (!el.closest('.problem-statement')) {
        el.classList.add('cf-hidden-element');
      }
    });
  }

  // Observe DOM changes for dynamic content
  function observeChanges() {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          shouldUpdate = true;
        }
      });
      
      if (shouldUpdate) {
        hideElements();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Enable/disable focus mode
  function setFocusMode(enabled) {
    settings.focusEnabled = enabled;
    
    if (enabled) {
      document.body.classList.add('cf-focus-mode');
      hideElements();
    } else {
      document.body.classList.remove('cf-focus-mode');
      document.body.classList.remove('cf-show-materials');
      document.body.classList.remove('cf-show-submit');
      document.body.classList.remove('cf-hide-contest-nav');
      // Remove hidden class from all elements
      document.querySelectorAll('.cf-hidden-element').forEach(el => {
        el.classList.remove('cf-hidden-element');
      });
    }
    
    saveSetting(STORAGE_KEYS.focusEnabled, enabled);
  }

  // Listen for messages from popup
  function setupMessageListener() {
    const messageHandler = (request, sender, sendResponse) => {
      if (request.action === 'toggleFocus') {
        setFocusMode(request.enabled);
      } else if (request.action === 'updateSettings') {
        settings.materialsVisible = request.materialsVisible;
        settings.submitVisible = request.submitVisible;
        settings.contestNavHidden = request.contestNavHidden;
        applyFocusMode();
      }
      return true;
    };

    if (typeof browser !== 'undefined') {
      browser.runtime.onMessage.addListener(messageHandler);
    } else if (typeof chrome !== 'undefined') {
      chrome.runtime.onMessage.addListener(messageHandler);
    }
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also run on window load to catch late-loading elements
  window.addEventListener('load', () => {
    hideElements();
  });

  // Setup message listener
  setupMessageListener();

})();