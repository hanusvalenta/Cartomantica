const { ipcRenderer } = require('electron');

if (document.getElementById('editorButton')) {
    document.getElementById('editorButton').addEventListener('click', () => {
        window.location.href = 'editor.html';
    });
}

if (document.getElementById('loadButton')) {
    document.getElementById('loadButton').addEventListener('click', () => {
        alert('Load functionality is not yet implemented.');
    });
}

if (document.getElementById('exitButton')) {
    document.getElementById('exitButton').addEventListener('click', () => {
        ipcRenderer.send('quit-app');
    });
}

// Editor Screen Logic
if (document.getElementById('newMapButton')) {
    document.getElementById('newMapButton').addEventListener('click', () => {
        alert('New map functionality will be implemented here.');
    });
}

if (document.getElementById('saveMapButton')) {
    document.getElementById('saveMapButton').addEventListener('click', () => {
        alert('Save map functionality will be implemented here.');
    });
}

if (document.getElementById('loadMapButton')) {
    document.getElementById('loadMapButton').addEventListener('click', () => {
        alert('Load map functionality will be implemented here.');
    });
}

if (document.getElementById('settingsButton')) {
    document.getElementById('settingsButton').addEventListener('click', () => {
        alert('Settings menu functionality will be implemented here.');
    });
}

if (document.getElementById('exitEditorButton')) {
    document.getElementById('exitEditorButton').addEventListener('click', () => {
        ipcRenderer.send('close-window');
    });
}
