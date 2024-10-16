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
let canvas = document.getElementById('mapCanvas');
let ctx = canvas ? canvas.getContext('2d') : null;

if (document.getElementById('newMapButton')) {
    document.getElementById('newMapButton').addEventListener('click', () => {
        if (ctx) {
            // Clear the canvas for a new map
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Set up default dimensions and settings for a new map
            canvas.width = 800;
            canvas.height = 600;

            // Optional: Draw grid lines or other default map features
            drawGrid(ctx, canvas);
        }
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

// Draw a basic grid for the map (optional)
function drawGrid(ctx, canvas) {
    const gridSize = 50; // Size of the grid cells

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}
