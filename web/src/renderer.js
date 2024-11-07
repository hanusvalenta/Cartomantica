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
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;
document.body.appendChild(renderer.domElement);

<<<<<<< Updated upstream
// Raycaster for object selection
=======
// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024 * 1.5;
directionalLight.shadow.mapSize.height = 1024 * 1.5;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.right = 10 * aspect;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.camera.left = -10 * aspect;
scene.add(directionalLight);

// Raycaster for object selection and mouse interaction
>>>>>>> Stashed changes
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
const planeMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
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

<<<<<<< Updated upstream
function spawnSelectedObject() {
    const geometry = new THREE.BoxGeometry(2, 2, 2); // Default to cube
    const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
    const newObject = new THREE.Mesh(geometry, material);
    newObject.position.y = 1; // Raise it above the plane slightly
    scene.add(newObject);
=======
import { spawnGLBObject } from '../../web/src/modelLoader.js'

function previewSelectedObject() {
    const selectedObjectType = document.getElementById('objectSelect').value;

    let geometry;
    switch (selectedObjectType) {
        case 'cube':
            spawnGLBObject(scene, './web/.src/models/houses/', 'Fantasy House')
            break;
        case 'tree':
            // Tree made of a cylinder trunk and cone foliage
            geometry = new THREE.Group();
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2), new THREE.MeshStandardMaterial({ color: 0x8B4513, castShadow: true }));
            const foliage = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 16), new THREE.MeshStandardMaterial({ color: 0x228B22, castShadow: true }));
            foliage.position.y = 1.5;
            trunk.castShadow = true;
            foliage.castShadow = true;
            geometry.add(trunk);
            geometry.add(foliage);
            break;
        case 'rock':
            // Rock using an irregular shape
            geometry = new THREE.DodecahedronGeometry(1);
            geometry.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.7, 1)); // Flatten for a rock shape
            break;
        case 'wall':
            // Wall using a stretched box
            geometry = new THREE.BoxGeometry(0.5, 2, 4);
            break;
        case 'table':
            // Table using a thin box and cylinder legs
            geometry = new THREE.Group();
            const tableTop = new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 2), new THREE.MeshStandardMaterial({ color: 0x8B4513, castShadow: true }));
            const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, castShadow: true });
            const legs = [];
            for (let i = 0; i < 4; i++) {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1), legMaterial);
                leg.position.set((i < 2 ? 1.3 : -1.3), -0.6, (i % 2 === 0 ? 0.8 : -0.8));
                leg.castShadow = true;
                legs.push(leg);
                geometry.add(leg);
            }
            tableTop.castShadow = true;
            geometry.add(tableTop);
            break;
        case 'chair':
            // Chair using a box seat and box backrest
            geometry = new THREE.Group();
            const seat = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 1), new THREE.MeshStandardMaterial({ color: 0x8B4513, castShadow: true }));
            const backrest = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.2), new THREE.MeshStandardMaterial({ color: 0x8B4513, castShadow: true }));
            backrest.position.y = 0.6;
            backrest.position.z = -0.4;
            seat.castShadow = true;
            backrest.castShadow = true;
            geometry.add(seat);
            geometry.add(backrest);
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

    const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, castShadow: true });
    if (selectedObjectType === 'tree' || selectedObjectType === 'table' || selectedObjectType === 'chair') {
        temporaryObject = geometry;
    } else {
        temporaryObject = new THREE.Mesh(geometry, material);
    }
    temporaryObject.position.set(0, 1, 0); // Position it slightly above the plane
    temporaryObject.castShadow = true;

    scene.add(temporaryObject);
    document.getElementById('objectList').style.display = 'none'; // Hide the menu after spawning
}

function placeObject() {
    if (temporaryObject) {
        // Detach the temporary object from cursor tracking
        temporaryObject = null;
    }
}

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
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
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

>>>>>>> Stashed changes
// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
