const THREE = require('three');

// Set up the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // White background

// Set up the camera (top-down orthographic camera)
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
  -10 * aspect, 10 * aspect, 10, -10, 0.1, 1000
);
camera.position.set(0, 50, 0);
camera.lookAt(0, 0, 0);

// Set up the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Raycaster for object selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;
let isEditMode = false;

// Create a canvas texture with random gray dots
function createDotTexture() {
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Fill with white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);

    // Add random gray dots
    const numberOfDots = 1000;
    ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';

    for (let i = 0; i < numberOfDots; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * 0.5 + 0.5;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20);
    return texture;
}

// Create a large plane with the dot texture
const planeGeometry = new THREE.PlaneGeometry(200, 200);
const texture = createDotTexture();
const planeMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Variables to handle camera dragging
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Add event listeners for buttons
document.getElementById('spawnBtn').addEventListener('click', spawnSelectedObject);
document.getElementById('editBtn').addEventListener('click', toggleEditMode);

// Add event listeners for mouse interactions
document.addEventListener('contextmenu', (e) => e.preventDefault(), false);
document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('mousemove', onMouseMove, false);
document.addEventListener('mouseup', onMouseUp, false);
document.addEventListener('wheel', onMouseWheel, false);
window.addEventListener('resize', onWindowResize, false);

function toggleEditMode() {
    isEditMode = !isEditMode;
    console.log(isEditMode ? "Edit mode enabled. Click on an object to edit." : "Edit mode disabled.");
}

function spawnSelectedObject() {
    const geometry = new THREE.BoxGeometry(2, 2, 2); // Default to cube
    const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
    const newObject = new THREE.Mesh(geometry, material);
    newObject.position.y = 1; // Raise it above the plane slightly
    scene.add(newObject);
}

function onMouseDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (intersectedObject === plane) {
            // Click on the plane to spawn
            return; // Do nothing since spawning is handled by the dropdown
        } else if (isEditMode) {
            // Select the object for interaction if in edit mode
            selectedObject = intersectedObject;
            console.log("Selected object:", selectedObject);
        }
    }

    if (event.button === 2) { // Right click for panning
        isDragging = true;
        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
    }
}

function onMouseMove(event) {
    if (!isDragging) return;

    const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y,
    };

    const panSpeed = 0.1; // Adjust pan speed here
    camera.position.x -= deltaMove.x * panSpeed;
    camera.position.z -= deltaMove.y * panSpeed;

    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
}

function onMouseUp(event) {
    if (selectedObject && isEditMode && event.button === 0) {
        // Perform editing actions based on mouse interactions
        selectedObject.rotation.y += Math.PI / 8; // Rotate object on left click
        selectedObject.scale.set(selectedObject.scale.x * 1.1, selectedObject.scale.y * 1.1, selectedObject.scale.z * 1.1); // Scale object
        console.log("Edited object:", selectedObject);
    }

    isDragging = false;
}

function onMouseWheel(event) {
    const zoomSpeed = 0.1;
    camera.zoom += event.deltaY * -zoomSpeed;
    camera.updateProjectionMatrix();
}

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -10 * aspect;
    camera.right = 10 * aspect;
    camera.top = 10;
    camera.bottom = -10;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
