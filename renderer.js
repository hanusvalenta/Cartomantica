const { ipcRenderer } = require('electron');

// Start Screen Logic
if (document.getElementById('editorButton')) {
    document.getElementById('editorButton').addEventListener('click', () => {
        window.location.href = 'editor.html'; // Navigate to the editor page
    });
}

if (document.getElementById('loadButton')) {
    document.getElementById('loadButton').addEventListener('click', () => {
        // Logic to load a saved map (implement later)
        alert('Load functionality is not yet implemented.');
    });
}

if (document.getElementById('exitButton')) {
    document.getElementById('exitButton').addEventListener('click', () => {
        ipcRenderer.send('quit-app'); // Send a message to the main process to quit the app
    });
}

// Editor Screen Logic
if (document.getElementById('newMapButton')) {
    document.getElementById('newMapButton').addEventListener('click', () => {
        // Logic to create a new map (implement later)
        alert('New map functionality will be implemented here.');
    });
}

if (document.getElementById('saveMapButton')) {
    document.getElementById('saveMapButton').addEventListener('click', () => {
        // Logic to save the map (implement later)
        alert('Save map functionality will be implemented here.');
    });
}

if (document.getElementById('loadMapButton')) {
    document.getElementById('loadMapButton').addEventListener('click', () => {
        // Logic to load an existing map (implement later)
        alert('Load map functionality will be implemented here.');
    });
}

if (document.getElementById('settingsButton')) {
    document.getElementById('settingsButton').addEventListener('click', () => {
        // Logic for opening the settings menu (implement later)
        alert('Settings menu functionality will be implemented here.');
    });
}

if (document.getElementById('exitEditorButton')) {
    document.getElementById('exitEditorButton').addEventListener('click', () => {
        ipcRenderer.send('close-window'); // Send a message to the main process to close the editor window
    });
}
