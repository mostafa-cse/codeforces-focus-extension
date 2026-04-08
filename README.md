# 🎯 Codeforces Focus Mode

A browser extension for Chrome and Firefox that removes distractions from Codeforces problem pages, letting you focus entirely on the problem statement.

## ✨ Features

### Hidden Elements (Always)

| Element | Description |
|---------|-------------|
| **Navbar** | Home, Top, Catalog, Contests, Gym, Problemset, Groups, Rating, Edu, API, Calendar, Help |
| **Logo** | Codeforces logo and branding |
| **Contest Info** | Contest name and details (right sidebar) |
| **Virtual Participation** | Virtual participation links |
| **Clone to Mashup** | Mashup creation links |
| **Footer** | Copyright and footer content |

### Optional Features (Toggle On/Off via Popup)

| Feature | Default | Description |
|---------|---------|-------------|
| **📝 Submit Button** | Hidden | Submit button on problem pages |
| **📚 Contest Materials** | Hidden | Tutorials, editorials, solutions |
| **📋 Hide Contest Nav** | Off (visible) | Problems, Submit, Status, Standings, Custom test tabs |

### Controls

- **🎛️ Popup Control**: Click the extension icon to toggle all features
- **💾 Persistent Settings**: Your preferences are saved across sessions
- **📱 Responsive**: Works on different screen sizes

## 🔧 Installation

### Chrome / Chromium / Edge

1. **Download** the extension files to your computer
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"**
5. Select the `codeforces-focus-extension` folder
6. The extension is now installed!

### Firefox

#### Method 1: Temporary Installation (for testing)

1. Open Firefox and navigate to `about:debugging`
2. Click **"This Firefox"** on the left sidebar
3. Click **"Load Temporary Add-on"**
4. Select the `manifest.json` file from the extension folder
5. The extension is now active for this session

#### Method 2: Permanent Installation

1. **Zip** all extension files into a `.zip` archive
2. Rename the `.zip` file to `.xpi`
3. Open Firefox and navigate to `about:addons`
4. Click the gear icon ⚙️ and select **"Install Add-on From File"**
5. Select the `.xpi` file
6. Confirm the installation

## 📖 Usage

### Automatic Activation

Once installed, the extension automatically activates on any Codeforces page:
- Navigate to any problem page (e.g., `codeforces.com/contest/xxx/problem/x`)
- Distractions are automatically hidden
- Only the problem statement remains visible

### Popup Controls

Click the extension icon in your browser toolbar for all options:
- **🎯 Focus Mode** - Enable/disable the entire extension
- **📝 Submit Button** - Show/hide submit button
- **📚 Contest Materials** - Show/hide contest materials
- **📋 Hide Contest Nav** - Hide/show the Problems/Submit/Status/Standings/Custom test tabs

Changes apply immediately to all open Codeforces tabs.

## 🏗️ File Structure

```
codeforces-focus-extension/
├── manifest.json          # Extension configuration (Manifest V3)
├── content.js             # Main script that modifies page content
├── styles.css             # CSS for hiding elements and styling
├── popup.html             # Extension popup UI
├── popup.js               # Popup interaction logic
├── icons/
│   ├── icon16.png         # Extension icon (16x16)
│   ├── icon32.png         # Extension icon (32x32)
│   ├── icon48.png         # Extension icon (48x48)
│   └── icon128.png        # Extension icon (128x128)
└── README.md              # This file
```

## 🔍 How It Works

The extension uses:
- **Content Scripts**: Injected into Codeforces pages to modify the DOM
- **CSS Classes**: Applied to hide specific elements based on selectors
- **Storage API**: Saves your preferences (contest materials visibility)
- **MutationObserver**: Watches for dynamic content changes

### CSS Selectors Used

```css
/* Navbar */
#header, .header, .menu-list, .menu

/* Logo */
#header .logo, .logo-codeforces

/* Footer */
#footer, .footer, .copyright

/* Sidebar elements */
.roundbox.sidebox, .sidebox

/* Problem page specific */
a[href*="virtual"], a[href*="mashup"], .submit
```

## 🛠️ Customization

To customize which elements are hidden, edit `styles.css`:

```css
/* Add your own selectors */
.cf-focus-mode .your-element-class {
  display: none !important;
}
```

## 🐛 Troubleshooting

### Extension not working?

1. **Refresh the page** - Content scripts load on page load
2. **Check URL** - Must be on `codeforces.com` domain
3. **Re-enable extension** - Toggle in popup or browser extensions page

### Contest materials not showing?

1. Open the extension popup and toggle **📚 Contest Materials**
2. Check if the page has contest materials available
3. Refresh the page after toggling

### Icons not showing?

Ensure all icon files are in the `icons/` folder with correct names:
- `icon16.png`
- `icon32.png`
- `icon48.png`
- `icon128.png`

## 📋 Compatibility

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 88+ |
| Firefox | 109+ |
| Edge | 88+ |
| Brave | 1.19+ |
| Opera | 74+ |

## 📜 License

This extension is open source. Feel free to modify and distribute.

## 🙏 Credits

Created for competitive programmers who want distraction-free problem solving on Codeforces.

## 📝 Changelog

### v1.2.0
- Removed floating buttons from page
- All controls now in popup only
- Added toggle for Contest Nav (Problems, Submit, Status, Standings, Custom test)

### v1.1.0
- Added separate toggle for Submit button
- Added popup controls for all features

### v1.0.0
- Initial release
- Hide navbar, footer, and sidebar elements
- Chrome and Firefox support
- Persistent settings storage