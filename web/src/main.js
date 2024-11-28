import * as THREE from '../../node_modules/three/build/three.module.js';
import { GLTFLoader } from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import { populateObjectList } from './modules/populateObjectList.js';
import { createHandDrawnOutline } from './modules/createHandDrawnOutline.js';

const scene = new THREE.Scene();
const loader = new GLTFLoader();
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

const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(30, 50, -30);
directionalLight.castShadow = true;

directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 300;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;

scene.add(directionalLight);

const transformControls = new TransformControls(camera, renderer.domElement);
scene.add(transformControls);

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
ground.name = "defaultGround";
scene.add(ground);

let spawnedObjects = [];
let spawnInterval = null;
let isSpawning = false;
let spawnTimer = null;

let moveDistance = 1;

const objectVelocity = { x: 0, y: 0, z: 0 };
const objectAcceleration = 0.05;
const objectFriction = 0.1;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;
let isEditMode = false;
let isDraggingObject = false;
let temporaryObject = null;
let rotationSpeed = 0;
const maxRotationSpeed = 0.1;
const rotationAcceleration = 0.01;
const rotationFriction = 0.1;
let scalingVelocity = 0;
const maxScalingSpeed = 0.05;
const scalingAcceleration = 0.01;
const scalingFriction = 0.1;

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
const daytimeSlider = document.getElementById('daytimeSlider');

let isMenuVisible = true;
let isDeleteMode = false;

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
    isDeleteMode = false;
    document.getElementById('objectList').style.display = 'block';
});
document.getElementById('editBtn').addEventListener('click', toggleEditMode);
document.getElementById('confirmSpawn').addEventListener('click', previewSelectedObject);

document.getElementById('createBtn').addEventListener('click', stopSpawningAndDelete);

document.addEventListener('contextmenu', (e) => e.preventDefault(), false);
document.addEventListener('mousedown', onMouseDown, false);
document.addEventListener('mousemove', onMouseMove, false);
document.addEventListener('mouseup', onMouseUp, false);
document.addEventListener('wheel', onMouseWheel, false);
window.addEventListener('resize', onWindowResize, false);
document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

window.addEventListener('DOMContentLoaded', populateObjectList);

document.getElementById('createBtn').addEventListener('click', () => {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('ui').style.display = 'block';
});

saveBtn.addEventListener('click', saveScene);

function saveScene() {
    const sceneData = spawnedObjects.map(obj => ({
        name: obj.name || 'Unnamed',
        position: obj.position.toArray(),
        rotation: obj.rotation.toArray(),
        scale: obj.scale.toArray(),
        geometry: obj.geometry ? obj.geometry.type : null,
        material: obj.material ? obj.material.color.getHex() : null,
    }));

    const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'scene.json';
    link.click();
}

document.getElementById('loadBtn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', loadSceneFromFile);
    input.click();
});

async function loadSceneFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileText = await file.text();
    const sceneData = JSON.parse(fileText);

    sceneData.forEach(data => {
        let geometry, material, object;

        switch (data.geometry) {
            case 'BoxGeometry':
                geometry = new THREE.BoxGeometry();
                break;
            case 'SphereGeometry':
                geometry = new THREE.SphereGeometry();
                break;
            // Add other geometries as needed
            default:
                console.warn(`Unknown geometry: ${data.geometry}`);
                return;
        }

        material = new THREE.MeshStandardMaterial({ color: data.material || 0xffffff });

        object = new THREE.Mesh(geometry, material);
        object.position.set(...data.position);
        object.rotation.set(...data.rotation);
        object.scale.set(...data.scale);
        object.castShadow = true;

        scene.add(object);
        spawnedObjects.push(object);
    });

    console.log('Scene Loaded Successfully.');
}

document.addEventListener('click', (event) => {
    const objectList = document.getElementById('objectList');
    const spawnBtn = document.getElementById('spawnBtn');

    if (!objectList.contains(event.target) && event.target !== spawnBtn) {
        objectList.style.display = 'none';
    }
});

transformControls.addEventListener('dragging-changed', (event) => {
    isDraggingObject = event.value;

    if (!isDraggingObject && !selectedObject) {
        transformControls.detach();
    }
});

document.getElementById('translateMode').addEventListener('click', () => {
    transformControls.setMode('translate');
});

document.getElementById('rotateMode').addEventListener('click', () => {
    transformControls.setMode('rotate');
});

document.getElementById('scaleMode').addEventListener('click', () => {
    transformControls.setMode('scale');
});

document.addEventListener('click', (event) => {
    const transformMenu = document.getElementById('transformMenu');
    const editBtn = document.getElementById('editBtn');

    if (!transformMenu.contains(event.target) && event.target !== editBtn) {
        transformMenu.style.display = 'none';
    }
})

function updateObjectPosition() {
    if (isEditMode && selectedObject) {
        objectVelocity.x *= (1 - objectFriction);
        objectVelocity.y *= (1 - objectFriction);
        objectVelocity.z *= (1 - objectFriction);

        selectedObject.position.x += objectVelocity.x;
        selectedObject.position.y += objectVelocity.y;
        selectedObject.position.z += objectVelocity.z;

        if (selectedObject.position.y < 0) {
            selectedObject.position.y = 0;
        }
    }
}

function attachTransformControls(object) {
    if (transformControls.object !== object) {
        transformControls.detach();
    }
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    selectedObject = null;
    isDeleteMode = false;

    const editBtn = document.getElementById('editBtn');
    editBtn.classList.toggle('active', isEditMode);

    const transformMenu = document.getElementById('transformMenu');
    transformMenu.style.display = isEditMode ? 'block' : 'none';

    if (!isEditMode) {
        transformControls.detach();
    }
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

function previewSelectedObject() {
    const selectedObjectType = document.getElementById('objectSelect').value;
    let geometry, material;

    const objectFromJson = objectData.find((obj) => obj.type === selectedObjectType);

    if (objectFromJson) {
        if (objectFromJson.geometry === "GLTF") {
            loader.load(
                objectFromJson.modelPath,
                (gltf) => {
                    temporaryObject = gltf.scene;
                    temporaryObject.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            const outline = createHandDrawnOutline(child);
                            child.add(outline);
                        }
                    });

                    const scale = objectFromJson.scale || [1, 1, 1];
                    temporaryObject.scale.set(scale[0], scale[1], scale[2]);

                    const yOffset = objectFromJson.yOffset || 1;
                    temporaryObject.position.set(0, yOffset, 0);
                    temporaryObject.castShadow = true;
                    scene.add(temporaryObject);

                    selectedObject = temporaryObject;
                    attachTransformControls(selectedObject);

                    document.getElementById('objectList').style.display = 'none';
                },
                undefined,
                (error) => {
                    console.error('Failed to load GLTF model:', error);
                }
            );
        }             

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
            default:
                console.warn(`Unknown geometry type: ${objectFromJson.geometry}`);
                return;
        }

        material = new THREE.MeshStandardMaterial({ color: objectFromJson.color || Math.random() * 0xffffff });

        temporaryObject = new THREE.Group();
        const mainMesh = new THREE.Mesh(geometry, material);
        mainMesh.castShadow = true;
        
        const outline = createHandDrawnOutline(mainMesh);

        temporaryObject.add(mainMesh);
        temporaryObject.add(outline);

        temporaryObject.castShadow = true;
        temporaryObject.position.set(0, 1, 0);
        scene.add(temporaryObject);

        if (objectFromJson.details) {
            addDetailsToObject(objectFromJson.details, temporaryObject);
        }

        document.getElementById('objectList').style.display = 'none';
    }
}

window.addEventListener('DOMContentLoaded', populateObjectList);

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

                        const outline = createHandDrawnOutline(clone);
                        clone.add(outline);

                        parentObject.add(clone);
                    });
                } else {
                    mesh.position.set(...details[positionKey]);
                    mesh.castShadow = true;

                    const outline = createHandDrawnOutline(mesh);
                    mesh.add(outline);

                    parentObject.add(mesh);
                }
            } else {
                mesh.position.set(0, 0, 0);

                const outline = createHandDrawnOutline(mesh);
                mesh.add(outline);

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

const nightColor = new THREE.Color(0x4040ff);
const sunriseColor = new THREE.Color(0xffa07a);
const dayColor = new THREE.Color(0xffffff);

let currentSliderValue = 8;
let targetSliderValue = currentSliderValue;

directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 300;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;

function updateSunPosition(deltaTime) {
    currentSliderValue += (targetSliderValue - currentSliderValue) * deltaTime;

    const normalizedTime = currentSliderValue / 24;
    const sunAngle = normalizedTime * Math.PI * 2;

    const sunX = Math.cos(sunAngle) * 100;
    const sunY = Math.max(Math.sin(sunAngle) * 80, 5);
    const sunZ = Math.sin(sunAngle) * 100;

    directionalLight.position.set(sunX, sunY, sunZ);
    directionalLight.target.position.set(0, 0, 0);

    const dayIntensity = 2.0;
    const nightIntensity = 0.1;
    const sunriseIntensity = 1.0;

    let intensity;
    if (currentSliderValue < 6) {
        intensity = THREE.MathUtils.lerp(nightIntensity, sunriseIntensity, currentSliderValue / 6);
        directionalLight.color.lerpColors(nightColor, sunriseColor, currentSliderValue / 6);
    } else if (currentSliderValue < 12) {
        intensity = THREE.MathUtils.lerp(sunriseIntensity, dayIntensity, (currentSliderValue - 6) / 6);
        directionalLight.color.lerpColors(sunriseColor, dayColor, (currentSliderValue - 6) / 6);
    } else if (currentSliderValue < 18) {
        intensity = THREE.MathUtils.lerp(dayIntensity, sunriseIntensity, (currentSliderValue - 12) / 6);
        directionalLight.color.lerpColors(dayColor, sunriseColor, (currentSliderValue - 12) / 6);
    } else {
        intensity = THREE.MathUtils.lerp(sunriseIntensity, nightIntensity, (currentSliderValue - 18) / 6);
        directionalLight.color.lerpColors(sunriseColor, nightColor, (currentSliderValue - 18) / 6);
    }

    directionalLight.intensity = intensity;

    directionalLight.shadow.camera.updateProjectionMatrix();
}

daytimeSlider.addEventListener('input', (event) => {
    targetSliderValue = parseFloat(event.target.value);
});

function spawnRandomObject() {
    if (!objectData.length) return;

    const randomIndex = Math.floor(Math.random() * objectData.length);
    const objectFromJson = objectData[randomIndex];
    let geometry, material;

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
        default:
            console.warn(`Unknown geometry type: ${objectFromJson.geometry}`);
            return;
    }

    material = new THREE.MeshStandardMaterial({ color: objectFromJson.color || Math.random() * 0xffffff });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.position.set(
        (Math.random() - 0.5) * 30,
        1,
        (Math.random() - 0.5) * 30
    );

    scene.add(mesh);
    spawnedObjects.push(mesh);
}

function startSpawning() {
    if (isSpawning) return;
    isSpawning = true;
    spawnInterval = setInterval(spawnRandomObject, 200);

    spawnTimer = setTimeout(stopSpawning, 20000);
}

function stopSpawning() {
    if (spawnInterval) {
        clearInterval(spawnInterval);
        spawnInterval = null;
    }
    isSpawning = false;
}

function stopSpawningAndDelete() {
    stopSpawning();

    spawnedObjects.forEach((obj) => {
        scene.remove(obj);
    });
    spawnedObjects = [];
}

startSpawning();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (isDraggingObject && selectedObject && selectedObject.name !== "defaultGround") {
        const intersects = raycaster.intersectObject(ground);
        if (intersects.length > 0) {
            const intersectionPoint = intersects[0].point;
            
            const objectToMove = selectedObject.isScene ? selectedObject : 
                (selectedObject.parent instanceof THREE.Group ? selectedObject.parent : selectedObject);
            
            intersectionPoint.y = objectToMove.position.y;
            
            objectToMove.position.copy(intersectionPoint);
            transformControls.attach(objectToMove);
        }
    } else if (temporaryObject) {
        const intersects = raycaster.intersectObject(ground);
        if (intersects.length > 0) {
            const intersectionPoint = intersects[0].point;
            
            intersectionPoint.y = temporaryObject.position.y;
            
            temporaryObject.position.copy(intersectionPoint);
        }
    }
}

function onMouseDown(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (temporaryObject && event.button === 0) {
        placeObject();
    }

    if (isDeleteMode) {
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            if (intersectedObject.name !== "defaultGround") {
                if (selectedObject === intersectedObject || selectedObject?.parent === intersectedObject) {
                    transformControls.detach();
                    selectedObject = null;
                }
    
                scene.remove(intersectedObject.parent || intersectedObject);
                transformControls.attach(ground);
                console.log("Object deleted:", intersectedObject);
            }
        }
        return;
    }

    if (isEditMode) {
        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;

            if (intersectedObject.material && intersectedObject.material.isLineBasicMaterial) return;

            if (intersectedObject.name === "defaultGround") {
                console.log("Ground is unmovable.");
                return;
            }

            if (selectedObject !== intersectedObject) {
                selectedObject = intersectedObject.parent instanceof THREE.Group 
                    ? intersectedObject.parent 
                    : intersectedObject;
                transformControls.detach();
                transformControls.attach(selectedObject);
            }
        } else {
            selectedObject = null;
            transformControls.detach();
        }
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
        if (event.key === '+') scalingVelocity = Math.min(scalingVelocity + scalingAcceleration, maxScalingSpeed);
        if (event.key === '-') scalingVelocity = Math.max(scalingVelocity - scalingAcceleration, -maxScalingSpeed);
        if (event.key === 'r') rotationSpeed = Math.min(rotationSpeed + rotationAcceleration, maxRotationSpeed);
        if (event.key === 't') rotationSpeed = Math.max(rotationSpeed - rotationAcceleration, -maxRotationSpeed);

        switch (event.key) {
            case 'ArrowUp':
                objectVelocity.z = Math.max(objectVelocity.z - objectAcceleration, -0.5);
                break;
            case 'ArrowDown':
                objectVelocity.z = Math.min(objectVelocity.z + objectAcceleration, 0.5);
                break;
            case 'ArrowLeft':
                objectVelocity.x = Math.max(objectVelocity.x - objectAcceleration, -0.5);
                break;
            case 'ArrowRight':
                objectVelocity.x = Math.min(objectVelocity.x + objectAcceleration, 0.5);
                break;
            case 'z':
                objectVelocity.y = Math.min(objectVelocity.y + objectAcceleration, 0.5);
                break;
            case 'x':
                objectVelocity.y = Math.max(objectVelocity.y - objectAcceleration, -0.5);
                break;
        }
    }

    if (event.key === 'w' || event.key === 'W') cameraMovement.forward = true;
    if (event.key === 's' || event.key === 'S') cameraMovement.backward = true;
    if (event.key === 'a' || event.key === 'A') cameraMovement.left = true;
    if (event.key === 'd' || event.key === 'D') cameraMovement.right = true;

    if (event.key === 'q' || event.key === 'Q') cameraMovement.zoomIn = true;
    if (event.key === 'e' || event.key === 'E') cameraMovement.zoomOut = true;

    if (event.key === 'Backspace') {
        if (selectedObject) {
            if (selectedObject.name !== "defaultGround") {
                scene.remove(selectedObject);
                transformControls.detach();
                console.log("Deleted object:", selectedObject.name || selectedObject.id);
                selectedObject = null;
            } else {
                console.log("Cannot delete the default ground.");
            }
        }
    }
}

function onKeyUp(event) {
    if (event.key === 'r' || event.key === 't') rotationSpeed = 0;
    if (event.key === '+' || event.key === '-') scalingVelocity = 0;

    if (event.key === 'w' || event.key === 'W') cameraMovement.forward = false;
    if (event.key === 's' || event.key === 'S') cameraMovement.backward = false;
    if (event.key === 'a' || event.key === 'A') cameraMovement.left = false;
    if (event.key === 'd' || event.key === 'D') cameraMovement.right = false;

    if (event.key === 'q' || event.key === 'Q') cameraMovement.zoomIn = false;
    if (event.key === 'e' || event.key === 'E') cameraMovement.zoomOut = false;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'z', 'x'].includes(event.key)) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') objectVelocity.z = 0;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') objectVelocity.x = 0;
        if (event.key === 'z' || event.key === 'x') objectVelocity.y = 0;
    }
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
    const deltaTime = 0.05;

    updateObjectPosition();

    updateSunPosition(deltaTime);

    if (isEditMode && selectedObject) {
        rotationSpeed *= (1 - rotationFriction);
        selectedObject.rotation.y += rotationSpeed;

        scalingVelocity *= (1 - scalingFriction);
        const newScale = selectedObject.scale.x + scalingVelocity;

        if (newScale > 0.1) {
            selectedObject.scale.set(newScale, newScale, newScale);
        }
    }

    renderer.render(scene, camera);
}

animate();