const THREE = require('three');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(-10 * aspect, 10 * aspect, 10, -10, 0.1, 1000);
camera.position.set(0, 50, 0);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
scene.add(directionalLight);

function createDotTexture() {
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);

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

const groundTexture = createDotTexture();
const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
const groundGeometry = new THREE.PlaneGeometry(200, 200);
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;
let isEditMode = false;
let isDraggingObject = false;
let temporaryObject = null;
let rotationSpeed = 0;

const cameraSpeed = 0.1;
const acceleration = 0.01;
const friction = 0.05;
const zoomSpeed = 0.01;
const velocity = { x: 0, z: 0 };
const zoomVelocity = { zoom: 0 };
const cameraMovement = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    zoomIn: false,
    zoomOut: false,
};

const toggleMenuBtn = document.getElementById('toggleMenuBtn');
const menuContainer = document.getElementById('menuContainer');

let isMenuVisible = true;

toggleMenuBtn.addEventListener('click', () => {
    isMenuVisible = !isMenuVisible;

    if (isMenuVisible) {
        menuContainer.classList.remove('hidden');
        toggleMenuBtn.classList.remove('show');
        toggleMenuBtn.textContent = '☰';
    } else {
        menuContainer.classList.add('hidden');
        toggleMenuBtn.classList.add('show');
        toggleMenuBtn.textContent = '→';
    }
});

document.getElementById('spawnBtn').addEventListener('click', () => {
    document.getElementById('objectList').style.display = 'block';
});
document.getElementById('editBtn').addEventListener('click', toggleEditMode);
document.getElementById('confirmSpawn').addEventListener('click', previewSelectedObject);

document.addEventListener('contextmenu', (e) => e.preventDefault(), false);
document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('mousemove', onMouseMove, false);
document.addEventListener('mouseup', onMouseUp, false);
document.addEventListener('wheel', onMouseWheel, false);
window.addEventListener('resize', onWindowResize, false);
document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

window.addEventListener('DOMContentLoaded', populateObjectList);

document.addEventListener('click', (event) => {
    const objectList = document.getElementById('objectList');
    const spawnBtn = document.getElementById('spawnBtn');

    if (!objectList.contains(event.target) && event.target !== spawnBtn) {
        objectList.style.display = 'none';
    }
});

function toggleEditMode() {
    isEditMode = !isEditMode;
    selectedObject = null;

    const editBtn = document.getElementById('editBtn');
    editBtn.classList.toggle('active', isEditMode);
}

let objectData = [];

async function loadObjectData() {
    try {
        const response = await fetch('objects.json');
        objectData = await response.json();
    } catch (error) {
        console.error('Failed to load object data:', error);
    }
}

loadObjectData();

function createHandDrawnOutline(mesh, color = 0x000000, thickness = 1) {
    const edgesGeometry = new THREE.EdgesGeometry(mesh.geometry);
    const outlineMaterial = new THREE.LineBasicMaterial({
        color: color,
        linewidth: thickness,
    });

    const outline = new THREE.LineSegments(edgesGeometry, outlineMaterial);

    outline.scale.set(1.01, 1.01, 1.01);

    mesh.add(outline);

    return outline;
}

function previewSelectedObject() {
    const selectedObjectType = document.getElementById('objectSelect').value;
    let geometry, material;

    const objectFromJson = objectData.find((obj) => obj.type === selectedObjectType);

    if (objectFromJson) {
        switch (objectFromJson.geometry) {
            case 'BoxGeometry':
                geometry = new THREE.BoxGeometry(...objectFromJson.parameters);
                break;
            case 'SphereGeometry':
                geometry = new THREE.SphereGeometry(...objectFromJson.parameters);
                break;
            case 'CylinderGeometry':
                geometry = new THREE.CylinderGeometry(...objectFromJson.parameters);
                break;
            case 'ConeGeometry':
                geometry = new THREE.ConeGeometry(...objectFromJson.parameters);
                break;
            case 'DodecahedronGeometry':
                geometry = new THREE.DodecahedronGeometry(...objectFromJson.parameters);
                break;
            case 'TorusGeometry':
                geometry = new THREE.TorusGeometry(...objectFromJson.parameters);
                break;
            default:
                console.warn(`Unknown geometry type: ${objectFromJson.geometry}`);
                return;
        }

        material = new THREE.MeshStandardMaterial({ color: objectFromJson.color || Math.random() * 0xffffff });
        temporaryObject = new THREE.Mesh(geometry, material);
        temporaryObject.castShadow = true;
        temporaryObject.position.set(0, 1, 0);
        scene.add(temporaryObject);

        createHandDrawnOutline(temporaryObject);

        if (objectFromJson.details) {
            addDetailsToObject(objectFromJson.details, temporaryObject);
        }

        document.getElementById('objectList').style.display = 'none';
    }
}

async function populateObjectList() {
    try {
        const response = await fetch('objects.json');
        const objects = await response.json();

        const objectSelect = document.getElementById('objectSelect');
        objectSelect.innerHTML = '';

        objects.forEach((object) => {
            const option = document.createElement('option');
            option.value = object.type;
            option.textContent = `${object.type.charAt(0).toUpperCase() + object.type.slice(1)}`;
            objectSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to populate object list:', error);
    }
}

function addDetailsToObject(details, parentObject) {
    for (const [key, value] of Object.entries(details)) {
        if (key.endsWith('Geometry')) {
            const geometryType = value;
            const parametersKey = key.replace('Geometry', 'Parameters');
            const colorKey = key.replace('Geometry', 'Color');
            const positionKey = key.replace('Geometry', 'Position') || `${key.replace('Geometry', 'Positions')}`;

            const geometry = new THREE[geometryType](...details[parametersKey]);
            const material = new THREE.MeshStandardMaterial({ color: details[colorKey] || Math.random() * 0xffffff });
            const mesh = new THREE.Mesh(geometry, material);

            if (details[positionKey]) {
                if (Array.isArray(details[positionKey][0])) {
                    details[positionKey].forEach((pos) => {
                        const clone = mesh.clone();
                        clone.position.set(...pos);
                        clone.castShadow = true;
                        parentObject.add(clone);
                    });
                } else {
                    mesh.position.set(...details[positionKey]);
                    mesh.castShadow = true;
                    parentObject.add(mesh);
                }
            } else {
                mesh.position.set(0, 0, 0);
                parentObject.add(mesh);
            }
        }
    }
}

function placeObject() {
    if (temporaryObject) {
        temporaryObject = null;
    }
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (isDraggingObject && selectedObject) {
        const intersects = raycaster.intersectObject(ground);
        if (intersects.length > 0) {
            selectedObject.position.copy(intersects[0].point).setY(1);
        }
    } else if (temporaryObject) {
        const intersects = raycaster.intersectObject(ground);
        if (intersects.length > 0) {
            temporaryObject.position.copy(intersects[0].point).setY(1);
        }
    }
}

function onMouseDown(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (temporaryObject && event.button === 0) {
        placeObject();
    } else if (isEditMode && intersects.length > 0) {
        selectedObject = intersects[0].object;
        isDraggingObject = true;
    }
}

function onMouseUp() {
    isDraggingObject = false;
}

function onMouseWheel(event) {
    camera.zoom = Math.max(0.1, Math.min(camera.zoom + event.deltaY * -0.005, 5));
    camera.updateProjectionMatrix();
}

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -10 * aspect;
    camera.right = 10 * aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    if (isEditMode && selectedObject) {
        if (event.key === 'r') rotationSpeed = 0.02;
        if (event.key === 't') rotationSpeed = -0.02;
        if (event.key === '+') selectedObject.scale.multiplyScalar(1.1);
        if (event.key === '-') selectedObject.scale.multiplyScalar(0.9);
    }

    if (event.key === 'w' || event.key === 'W') cameraMovement.forward = true;
    if (event.key === 's' || event.key === 'S') cameraMovement.backward = true;
    if (event.key === 'a' || event.key === 'A') cameraMovement.left = true;
    if (event.key === 'd' || event.key === 'D') cameraMovement.right = true;

    if (event.key === 'q' || event.key === 'Q') cameraMovement.zoomIn = true;
    if (event.key === 'e' || event.key === 'E') cameraMovement.zoomOut = true;
}

function onKeyUp(event) {
    if (event.key === 'r' || event.key === 't') rotationSpeed = 0;

    if (event.key === 'w' || event.key === 'W') cameraMovement.forward = false;
    if (event.key === 's' || event.key === 'S') cameraMovement.backward = false;
    if (event.key === 'a' || event.key === 'A') cameraMovement.left = false;
    if (event.key === 'd' || event.key === 'D') cameraMovement.right = false;

    if (event.key === 'q' || event.key === 'Q') cameraMovement.zoomIn = false;
    if (event.key === 'e' || event.key === 'E') cameraMovement.zoomOut = false;
}

function updateCameraPosition() {
    if (cameraMovement.forward) velocity.z -= acceleration;
    if (cameraMovement.backward) velocity.z += acceleration;
    if (cameraMovement.left) velocity.x -= acceleration;
    if (cameraMovement.right) velocity.x += acceleration;

    velocity.x *= (1 - friction);
    velocity.z *= (1 - friction);

    camera.position.x += velocity.x;
    camera.position.z += velocity.z;

    if (cameraMovement.zoomIn) zoomVelocity.zoom -= zoomSpeed;
    if (cameraMovement.zoomOut) zoomVelocity.zoom += zoomSpeed;

    zoomVelocity.zoom *= (1 - friction);

    camera.zoom = Math.max(0.5, Math.min(camera.zoom + zoomVelocity.zoom, 5));
    camera.updateProjectionMatrix();
}

function animate() {
    requestAnimationFrame(animate);

    updateCameraPosition();

    if (isEditMode && selectedObject) selectedObject.rotation.y += rotationSpeed;
    renderer.render(scene, camera);
}

animate();
