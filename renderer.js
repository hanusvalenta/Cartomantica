const { remote } = require('electron');
const fs = require('fs');
const path = require('path');

document.getElementById('newMapButton').addEventListener('click', () => {
    // Handle creating a new map
    createNewMap();
});

document.getElementById('loadMapButton').addEventListener('click', () => {
    // Handle loading a saved map
    loadMap();
});

function createNewMap() {
    // Logic for creating a new map (e.g., clear the canvas, reset settings)
    alert('New map created!');
    // Implement your map creation logic here
}

function loadMap() {
    // Use the dialog to open a file
    remote.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Maps', extensions: ['json'] } // Assuming your saved maps are in JSON format
        ]
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            const filePath = result.filePaths[0];
            fs.readFile(filePath, 'utf-8', (err, data) => {
                if (err) {
                    alert('Error reading file: ' + err.message);
                    return;
                }
                // Assuming your map data is in JSON format
                const mapData = JSON.parse(data);
                // Implement logic to load the map data into your canvas
                alert('Loaded map from ' + filePath);
                // You may need to implement a function to render the loaded map
                renderMap(mapData);
            });
        }
    }).catch(err => {
        alert('Error: ' + err.message);
    });
}

function renderMap(mapData) {
    // Logic to render the loaded map on the canvas
    console.log(mapData); // Placeholder for your rendering logic
}
