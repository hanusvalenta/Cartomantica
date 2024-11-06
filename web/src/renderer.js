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

// Raycaster for object selection and mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;
let isEditMode = false;
let temporaryObject = null; // Temporary object for placement preview
let isDraggingObject = false; // Track if an object is being dragged
let rotationSpeed = 0; // Track rotation speed for smooth rotation

// Camera movement variables
const acceleration = 0.02;
const maxSpeed = 0.5;
const friction = 0.1;
const velocity = { x: 0, z: 0 };
const cameraMovement = { forward: false, backward: false, left: false, right: false, zoomIn: false, zoomOut: false };

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
document.getElementById('spawnBtn').addEventListener('click', () => {
    document.getElementById('objectList').style.display = 'block';
});
document.getElementById('editBtn').addEventListener('click', toggleEditMode);
document.getElementById('confirmSpawn').addEventListener('click', previewSelectedObject);

// Add event listeners for mouse interactions
document.addEventListener('contextmenu', (e) => e.preventDefault(), false);
document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('mousemove', onMouseMove, false);
document.addEventListener('mouseup', onMouseUp, false);
document.addEventListener('wheel', onMouseWheel, false);
window.addEventListener('resize', onWindowResize, false);

// Add event listeners for keyboard controls
document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

function toggleEditMode() {
    isEditMode = !isEditMode;
    selectedObject = null; // Clear any selected object when toggling mode

    // Toggle active class on the Edit button
    const editBtn = document.getElementById('editBtn');
    if (isEditMode) {
        editBtn.classList.add('active');
        console.log("Edit mode enabled. Click on an object to edit.");
    } else {
        editBtn.classList.remove('active');
        console.log("Edit mode disabled.");
    }
}

function previewSelectedObject() {
    const selectedObjectType = document.getElementById('objectSelect').value;

    let geometry;
    switch (selectedObjectType) {
        case 'cube':
            geometry = new THREE.BoxGeometry(2, 2, 2);
            break;
        case 'sphere':
            geometry = new THREE.SphereGeometry(1.5, 32, 32);
            break;
        case 'cone':
            geometry = new THREE.ConeGeometry(1, 3, 32);
            break;
        case 'cylinder':
            geometry = new THREE.CylinderGeometry(1, 1, 3, 32);
            break;
        case 'torus':
            geometry = new THREE.TorusGeometry(1.5, 0.5, 16, 100);
            break;
        default:
            console.warn('Unknown object type:', selectedObjectType);
            return;
    }

    const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
    temporaryObject = new THREE.Mesh(geometry, material);
    temporaryObject.position.set(0, 1, 0); // Position it slightly above the plane

    scene.add(temporaryObject);
    document.getElementById('objectList').style.display = 'none'; // Hide the menu after spawning
}

function placeObject() {
    if (temporaryObject) {
        // Detach the temporary object from cursor tracking
        temporaryObject = null;
    }
}

// Update object position under the cursor when moving the mouse
function onMouseMove(event) {
    if (temporaryObject) {
        // Update mouse coordinates for raycasting
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(plane);

        if (intersects.length > 0) {
            const intersectPoint = intersects[0].point;
            temporaryObject.position.set(intersectPoint.x, 1, intersectPoint.z); // Move object to mouse position
        }
    }

    if (isEditMode && selectedObject && isDraggingObject) {
        // Update mouse coordinates for raycasting
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(plane);

        if (intersects.length > 0) {
            const intersectPoint = intersects[0].point;
            selectedObject.position.set(intersectPoint.x, 1, intersectPoint.z); // Move selected object to mouse position
        }
    }

    if (isDragging) {
        // Handle camera dragging as before
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y,
        };

        const panSpeed = 0.1;
        camera.position.x -= deltaMove.x * panSpeed;
        camera.position.z -= deltaMove.y * panSpeed;

        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
    }
}

function onMouseDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (temporaryObject && event.button === 0) { // Left click to place object
        placeObject();
    } else if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (intersectedObject !== plane && isEditMode) {
            // Select object for editing if in edit mode
            selectedObject = intersectedObject;
            isDraggingObject = true;
            console.log("Selected object:", selectedObject);
        }
    }

    if (event.button === 2) { // Right click for panning
        isDragging = true;
        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
    }
}

function onMouseUp(event) {
    if (isEditMode && selectedObject && event.button === 0) {
        // Finalize dragging the object on mouse up
        isDraggingObject = false;
    }
    isDragging = false;
}

function onMouseWheel(event) {
    const zoomSpeed = 0.005; // Smaller zoom speed for smoother zooming
    const targetZoom = camera.zoom + event.deltaY * -zoomSpeed; // Calculate target zoom level

    // Limit the zoom levels for smoother experience
    camera.zoom = Math.max(0.1, Math.min(5, targetZoom)); // Min zoom level of 0.1 and max of 5
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

// Keyboard event handlers
function onKeyDown(event) {
    if (isEditMode && selectedObject) {
        switch (event.key) {
            case 'r': // Rotate clockwise
                rotationSpeed = 0.02;
                break;
            case 't': // Rotate counterclockwise
                rotationSpeed = -0.02;
                break;
            case '+': // Scale up
                selectedObject.scale.multiplyScalar(1.1);
                break;
            case '-': // Scale down
                selectedObject.scale.multiplyScalar(0.9);
                break;
        }
    }

    switch (event.key) {
        case 'w':
        case 'W':
            cameraMovement.forward = true;
            break;
        case 's':
        case 'S':
            cameraMovement.backward = true;
            break;
        case 'a':
        case 'A':
            cameraMovement.left = true;
            break;
        case 'd':
        case 'D':
            cameraMovement.right = true;
            break;
        case 'e':
        case 'E':
            cameraMovement.zoomIn = true;
            break;
        case 'q':
        case 'Q':
            cameraMovement.zoomOut = true;
            break;
    }
}

function onKeyUp(event) {
    if (event.key === 'r' || event.key === 't') {
        rotationSpeed = 0; // Stop rotation when key is released
    }

    switch (event.key) {
        case 'w':
        case 'W':
            cameraMovement.forward = false;
            break;
        case 's':
        case 'S':
            cameraMovement.backward = false;
            break;
        case 'a':
        case 'A':
            cameraMovement.left = false;
            break;
        case 'd':
        case 'D':
            cameraMovement.right = false;
            break;
        case 'e':
        case 'E':
            cameraMovement.zoomIn = false;
            break;
        case 'q':
        case 'Q':
            cameraMovement.zoomOut = false;
            break;
    }
}

// Update camera position with smooth movement
function updateCameraPosition() {
    // Accelerate movement in each direction based on keys pressed
    if (cameraMovement.forward) velocity.z = Math.max(velocity.z - acceleration, -maxSpeed);
    if (cameraMovement.backward) velocity.z = Math.min(velocity.z + acceleration, maxSpeed);
    if (cameraMovement.left) velocity.x = Math.max(velocity.x - acceleration, -maxSpeed);
    if (cameraMovement.right) velocity.x = Math.min(velocity.x + acceleration, maxSpeed);

    // Apply friction to gradually slow down when keys are released
    if (!cameraMovement.forward && !cameraMovement.backward) velocity.z *= 1 - friction;
    if (!cameraMovement.left && !cameraMovement.right) velocity.x *= 1 - friction;

    // Update camera position
    camera.position.x += velocity.x;
    camera.position.z += velocity.z;

    // Zoom in and out based on E and Q keys
    const zoomSpeed = 0.02;
    if (cameraMovement.zoomIn) {
        camera.zoom = Math.min(camera.zoom + zoomSpeed, 5); // Limit max zoom level
    }
    if (cameraMovement.zoomOut) {
        camera.zoom = Math.max(camera.zoom - zoomSpeed, 0.1); // Limit min zoom level
    }
    camera.updateProjectionMatrix();
}

// Update object rotation with smooth effect
function updateObjectRotation() {
    if (isEditMode && selectedObject && rotationSpeed !== 0) {
        selectedObject.rotation.y += rotationSpeed;
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    updateCameraPosition(); // Update camera position based on key input
    updateObjectRotation(); // Smoothly rotate the selected object
    renderer.render(scene, camera);
}

animate();
