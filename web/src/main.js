<<<<<<< Updated upstream
import * as THREE from 'three';
import { setupScene, initCamera } from './scene.js';
import { setupLighting } from './lighting.js';
import { createGround, loadObjectData, spawnRandomObject, startSpawning, setupObjectEditing } from './objects.js';
import { setupControls, setupUI } from './controls.js';
import { updateSunPosition, daytimeSlider } from './sun.js';
=======
import * as THREE from '../../node_modules/three/build/three.module.js';
import { GLTFLoader } from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import { populateObjectList } from './modules/populateObjectList.js';
import { createHandDrawnOutline } from './modules/createHandDrawnOutline.js';
import { createPathMaterial, createPathGeometry } from './modules/pathShader.js';
import { createWaterMaterial, createWaterGeometry } from './modules/waterShader.js'
>>>>>>> Stashed changes

<<<<<<< Updated upstream
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
=======
// Initialize scene, camera, and renderer from setupScene function
const { scene, camera, renderer } = setupScene();
>>>>>>> Stashed changes

// Setup lighting (returns an object with directionalLight)
const { directionalLight } = setupLighting(scene);

<<<<<<< Updated upstream
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
ground.name = "defaultGround";
scene.add(ground);

let spawnedObjects = [];
let spawnInterval = null;
let isSpawning = false;
let spawnTimer = null;

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
const deleteBtn = document.getElementById('deleteBtn');
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
    document.getElementById('objectList').style.display = 'block';
});
document.getElementById('editBtn').addEventListener('click', toggleEditMode);
document.getElementById('confirmSpawn').addEventListener('click', previewSelectedObject);

document.addEventListener('contextmenu', (e) => e.preventDefault(), false);
document.removeEventListener('mousedown', onMouseDown, false);
document.addEventListener('mousedown', modifiedOnMouseDown, false);
document.removeEventListener('mousemove', onMouseMove, false);
document.addEventListener('mousemove', modifiedOnMouseMove, false);
document.addEventListener('mouseup', onMouseUp, false);
document.addEventListener('wheel', onMouseWheel, false);
window.addEventListener('resize', onWindowResize, false);
document.removeEventListener('keydown', onKeyDown, false);
document.addEventListener('keydown', modifiedOnKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

window.addEventListener('DOMContentLoaded', populateObjectList);

document.getElementById('createBtn').addEventListener('click', () => {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('ui').style.display = 'block';
});

document.getElementById('loadBtn').addEventListener('click', () => {
    console.log('Load feature will be implemented later.');
});

document.addEventListener('click', (event) => {
    const objectList = document.getElementById('objectList');
    const spawnBtn = document.getElementById('spawnBtn');

    if (!objectList.contains(event.target) && event.target !== spawnBtn) {
        objectList.style.display = 'none';
    }
});

deleteBtn.addEventListener('click', () => {
    isDeleteMode = !isDeleteMode;
    isEditMode = false;

    deleteBtn.classList.toggle('active', isDeleteMode);
    editBtn.classList.remove('active');

    if (isDeleteMode) {
        console.log('Delete mode activated.');
    } else {
        console.log('Delete mode deactivated.');
    }
});

<<<<<<< Updated upstream
function toggleEditMode() {
    isEditMode = !isEditMode;
    selectedObject = null;
    isDeleteMode = false;

    deleteBtn.classList.remove('active');

    const editBtn = document.getElementById('editBtn');
    editBtn.classList.toggle('active', isEditMode);
}
=======
// Create ground in the scene
const ground = createGround(scene);
>>>>>>> Stashed changes

// Load object data asynchronously and start spawning objects when done
=======
transformControls.addEventListener('dragging-changed', (event) => {
    isDraggingObject = event.value;
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

function attachTransformControls(object) {
    transformControls.attach(object);
}

>>>>>>> Stashed changes
let objectData = [];
<<<<<<< Updated upstream

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
    outline.renderOrder = 1;
    outline.raycast = () => {};

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

let currentSliderValue = parseFloat(daytimeSlider.value);
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

    ambientLight.intensity = 0.1 + Math.max(sunY / 160, 0.05);

    directionalLight.shadow.camera.updateProjectionMatrix();
}

daytimeSlider.addEventListener('input', (event) => {
    targetSliderValue = parseFloat(event.target.value);
=======
loadObjectData().then(() => {
  startSpawning(); // Assuming this will use the loaded data to spawn objects
  setupObjectEditing(scene); // Setup object editing after objects are spawned
>>>>>>> Stashed changes
});

// Update Sun Position for the day/night cycle
let lastTime = 0;
function animate(time) {
  const deltaTime = (time - lastTime) * 0.001;
  updateSunPosition(deltaTime); // Updates the sun's position based on time of day
  lastTime = time;

  // Render the scene with the camera
  renderer.render(scene, camera);

  // Recursively call animate to create the animation loop
  requestAnimationFrame(animate);
}

// Start the animation loop
requestAnimationFrame(animate);

<<<<<<< Updated upstream
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

document.getElementById('createBtn').addEventListener('click', stopSpawningAndDelete);

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (isDraggingObject && selectedObject && selectedObject.name !== "defaultGround") {
        const intersects = raycaster.intersectObject(ground);
        if (intersects.length > 0) {
            selectedObject.position.copy(intersects[0].point).setY(1);
        }
    }    
    else if (temporaryObject) {
        const intersects = raycaster.intersectObject(ground);
        if (intersects.length > 0) {
            temporaryObject.position.copy(intersects[0].point).setY(1);
        }
    }
}
function modifiedOnMouseMove(event) {
    onMouseMove(event);

    // If in curve mode and have at least one point, show potential next point
    if (isCurveMode && curveModePoints.length > 0) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(ground);

        if (intersects.length > 0) {
            const point = intersects[0].point.clone();
            point.y = 0.05;  // Slightly above ground

            // Temporarily add potential point to draw preview
            const tempPoints = [...curveModePoints, point];
            
            if (currentPathMesh) {
                scene.remove(currentPathMesh);
            }
            currentPathMesh = createPath(tempPoints);
            if (currentPathMesh) {
                scene.add(currentPathMesh);
            }
        }
    }
}

function onMouseDown(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (temporaryObject && event.button === 0) {
        placeObject();
    } 
    if (isEditMode && intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (intersectedObject.material && intersectedObject.material.isLineBasicMaterial) return;
        
        if (intersectedObject.name === "defaultGround") {
            console.log("Ground is unmovable.");
            return;
        }
    
        // Ensure we select the parent group or the object itself
        const objectToSelect = intersectedObject.parent instanceof THREE.Group 
            ? intersectedObject.parent 
            : intersectedObject;
        
        // Always attach transform controls, even if it's the same object
        selectedObject = objectToSelect;
        transformControls.attach(selectedObject);
        isDraggingObject = true;
    } 
    if (isDeleteMode && intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const objectToDelete = intersectedObject.parent instanceof THREE.Group 
            ? intersectedObject.parent 
            : intersectedObject;
    
        if (objectToDelete.name === "defaultGround") {
            console.log("Default ground cannot be deleted.");
            return;
        }
    
        // If the deleted object is the currently selected object, detach transform controls
        if (objectToDelete === selectedObject) {
            transformControls.detach();
            selectedObject = null;
        }
        
        scene.remove(objectToDelete);
        console.log('Object deleted:', objectToDelete);
    }
}
function modifiedOnMouseDown(event) {
    // If not in curve mode, use original mouse down logic
    if (!isCurveMode) {
        onMouseDown(event);
        return;
    }

    // Prevent other interactions while drawing paths
    if (event.button !== 0) return;  // Only left mouse button

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(ground);

    if (intersects.length > 0) {
        const point = intersects[0].point.clone();
        point.y = 0.05;  // Slightly above ground
        curveModePoints.push(point);

        // Update or create path
        if (currentPathMesh) {
            scene.remove(currentPathMesh);
        }
        currentPathMesh = createPath(curveModePoints);
        if (currentPathMesh) {
            scene.add(currentPathMesh);
        }
    }
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    
    if (!isEditMode) {
        // When turning off edit mode, detach transform controls and clear selected object
        transformControls.detach();
        selectedObject = null;
    }

    isDeleteMode = false;

    deleteBtn.classList.remove('active');

    const editBtn = document.getElementById('editBtn');
    editBtn.classList.toggle('active', isEditMode);

    const transformMenu = document.getElementById('transformMenu');
    transformMenu.style.display = isEditMode ? 'block' : 'none';
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
    }

    if (event.key === 'w' || event.key === 'W') cameraMovement.forward = true;
    if (event.key === 's' || event.key === 'S') cameraMovement.backward = true;
    if (event.key === 'a' || event.key === 'A') cameraMovement.left = true;
    if (event.key === 'd' || event.key === 'D') cameraMovement.right = true;

    if (event.key === 'q' || event.key === 'Q') cameraMovement.zoomIn = true;
    if (event.key === 'e' || event.key === 'E') cameraMovement.zoomOut = true;
}
function modifiedOnKeyDown(event) {
    // If path mode is active, 'Escape' key clears the current path
    if (isCurveMode) {
        if (event.key === 'Escape') {
            clearPathDrawing();
        }
        
        // 'Enter' key finalizes the path
        if (event.key === 'Enter' && curveModePoints.length > 1) {
            // Save the path permanently
            if (currentPathMesh) {
                paths.push(currentPathMesh);
            }
            
            isCurveMode = false;
            curvesBtn.classList.remove('active');
            currentPathMesh = null;
            curveModePoints = [];
        }
    }

    // Call the original key down handler for other functionality
    onKeyDown(event);
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

let isCurveMode = false;
let curveModePoints = [];
let currentPathMesh = null;
let paths = [];  // Store created paths
let animationTime = 0;

const curvesBtn = document.createElement('button');
curvesBtn.id = 'path';
curvesBtn.textContent = 'Path';
document.getElementById('menuContainer').appendChild(curvesBtn);

const water = document.createElement('button');
water.id = 'water';
water.textContent = 'Water';
document.getElementById('menuContainer').appendChild(water);

curvesBtn.addEventListener('click', () => {
    isCurveMode = !isCurveMode;
    curvesBtn.classList.toggle('active', isCurveMode);
    
    // Reset any existing drawing
    if (curveModePoints.length > 0) {
        clearPathDrawing();
    }

    // Deactivate other modes
    isEditMode = false;
    isDeleteMode = false;
    deleteBtn.classList.remove('active');
    const editBtn = document.getElementById('editBtn');
    editBtn.classList.remove('active');
});

water.addEventListener('click', () => {
    isCurveMode = !isCurveMode;
    water.classList.toggle('active', isCurveMode);
    
    // Reset any existing drawing
    if (curveModePoints.length > 0) {
        clearPathDrawing();
    }

    // Deactivate other modes
    isEditMode = false;
    isDeleteMode = false;
    deleteBtn.classList.remove('active');
    const editBtn = document.getElementById('editBtn');
    editBtn.classList.remove('active');
});


function clearPathDrawing() {
    if (currentPathMesh) {
        scene.remove(currentPathMesh);
        currentPathMesh = null;
    }
    curveModePoints = [];
}

function createPath(points) {
    if (points.length < 2) return null;

    // Adjust points to be at ground level with slight elevation
    const adjustedPoints = points.map(point => {
        const newPoint = point.clone();
        newPoint.y = 0.05;  // Slightly above ground
        return newPoint;
    });

    // Check which mode is active and use corresponding shader
    const pathGeometry = isCurveMode 
        ? createPathGeometry(adjustedPoints, 1)  // Path shader
        : createWaterGeometry(adjustedPoints, 1); // Water shader
    
    const pathMaterial = isCurveMode 
        ? createPathMaterial()  // Path material
        : createWaterMaterial(); // Water material
    
    // Create mesh
    const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
    return pathMesh;
}

function createCurveLine(points) {
    if (points.length < 2) return null;

    // Create a curve through the points
    const curve = new THREE.CatmullRomCurve3(points);
    
    // Interpolate more points along the curve for smooth rendering
    const points2 = curve.getPoints(50);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points2);
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x000000,  // Black color
        linewidth: 5      // Thicker line
    });
    
    const curveLine = new THREE.Line(lineGeometry, lineMaterial);
    curveLine.position.y = 0.1;  // Slightly above ground to prevent z-fighting
    return curveLine;
}


function animate() {
    requestAnimationFrame(animate);

    updateCameraPosition();

    const deltaTime = 0.05;

    updateSunPosition(deltaTime);

    directionalLight.position.copy(camera.position);
    directionalLight.position.y += 10;

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
function modifiedAnimate() {
    requestAnimationFrame(modifiedAnimate);

<<<<<<< Updated upstream
animate();


// Create a loader instance
const loader = new GLTFLoader();

// Load a glTF resource
loader.load(
  './models/maxwell.glb',
  function (gltf) {
    // Add the loaded model to the scene
    scene.add(gltf.scene);
  },
  undefined,
  function (error) {
    console.error('An error happened', error);
  }
);
=======
// UI Controls
setupUI();
setupControls(camera, scene);
>>>>>>> Stashed changes
=======
    updateCameraPosition();

    const deltaTime = 0.05;

    updateSunPosition(deltaTime);

    // Update shader time for path animations
    animationTime += deltaTime;
    
    // Update time uniform for all path materials
    paths.forEach(path => {
        if (path.material && path.material.uniforms) {
            path.material.uniforms.time.value = animationTime;
        }
    });

    // Update current path material if exists
    if (currentPathMesh && currentPathMesh.material && currentPathMesh.material.uniforms) {
        currentPathMesh.material.uniforms.time.value = animationTime;
    }

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

modifiedAnimate();
>>>>>>> Stashed changes
