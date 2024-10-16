let isLassoToolActive = true; // Track the current tool state
let isDrawing = false; // Track if the user is currently drawing
let lakePath = []; // Array to store the points for the lake

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const waterTexture = new Image();
waterTexture.src = 'water_texture.png'; // Load your water texture here

// Function to create a new map
function createNewMap() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Reset any other states or data needed for a new map
    lakePath = []; // Clear the lake path
    isDrawing = false; // Ensure we are not in drawing mode
}

// Function to start drawing
function startDrawing(event) {
    isDrawing = true;
    lakePath = []; // Reset the path
    lakePath.push(getMousePosition(event)); // Get starting position
}

// Function to draw the lake
function drawLake(event) {
    if (!isDrawing) return;

    const currentPosition = getMousePosition(event);
    lakePath.push(currentPosition); // Add current position to path

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.beginPath();
    ctx.moveTo(lakePath[0].x, lakePath[0].y); // Start path at the first point

    // Draw lines to all points in the lake path
    lakePath.forEach(point => {
        ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();

    // Fill the drawn shape with the water texture
    ctx.fillStyle = ctx.createPattern(waterTexture, 'repeat'); // Create a pattern
    ctx.fill();
}

// Function to finish drawing
function finishDrawing() {
    isDrawing = false;
}

// Helper function to get mouse position on the canvas
function getMousePosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

// Tool button event listener
if (document.getElementById('lassoLakeToolButton')) {
    document.getElementById('lassoLakeToolButton').addEventListener('click', () => {
        // Toggle between Lasso Tool and Lake Tool
        isLassoToolActive = !isLassoToolActive;

        if (isLassoToolActive) {
            document.getElementById('lassoLakeToolButton').innerText = 'Lasso Tool';
            alert('Lasso Tool activated. Draw around the area you want to select.');
            // Remove drawing event listeners
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', drawLake);
            canvas.removeEventListener('mouseup', finishDrawing);
        } else {
            document.getElementById('lassoLakeToolButton').innerText = 'Lake Tool';
            alert('Lake Tool activated. Click and drag to draw a lake.');
            // Set event listeners for drawing
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', drawLake);
            canvas.addEventListener('mouseup', finishDrawing);
        }
    });
}

// Event listener for the New Map button
if (document.getElementById('newMapButton')) {
    document.getElementById('newMapButton').addEventListener('click', () => {
        createNewMap(); // Call the function to create a new map
    });
}
