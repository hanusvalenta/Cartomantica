document.getElementById('editorButton').addEventListener('click', () => {
    // Logic to open the editor
    window.location.href = 'index.html'; // Change to your editor page
});

document.getElementById('loadButton').addEventListener('click', () => {
    // Logic to load a saved map
    alert('Load functionality is not yet implemented.');
});

const { ipcRenderer } = require('electron');

document.getElementById('exitButton').addEventListener('click', () => {
    ipcRenderer.send('exit-app'); // Send exit signal to main process
});
