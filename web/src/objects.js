import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createHandDrawnOutline } from './utils.js';

let objectData = [];

export async function loadObjectData() {
  try {
    const response = await fetch('objects.json');
    objectData = await response.json();
  } catch (error) {
    console.error('Failed to load object data:', error);
  }
}

export function createGround(scene) {
  const createDotTexture = () => {
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
  };

  const groundTexture = createDotTexture();
  const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
  const groundGeometry = new THREE.PlaneGeometry(200, 200);
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = "defaultGround";
  scene.add(ground);
  return ground;
}

export function spawnRandomObject(scene) {
  const loader = new GLTFLoader();
  const randomObject = objectData[Math.floor(Math.random() * objectData.length)];

  if (randomObject) {
    loader.load(randomObject.modelUrl, (gltf) => {
      const object = gltf.scene;
      object.name = randomObject.name;
      object.position.set(
        Math.random() * 20 - 10, 
        5, 
        Math.random() * 20 - 10
      );
      object.scale.set(1, 1, 1);
      object.castShadow = true;
      object.receiveShadow = true;
      scene.add(object);
      createHandDrawnOutline(object, randomObject.color);
    });
  }
}

export function startSpawning() {
  setInterval(() => {
    spawnRandomObject(scene);
  }, 2000);  // spawn an object every 2 seconds
}

export function setupObjectEditing() {
  const deleteButton = document.getElementById('deleteButton');
  deleteButton.addEventListener('click', () => {
    if (selectedObject) {
      scene.remove(selectedObject);
      selectedObject = null;
    }
  });

  const editButton = document.getElementById('editButton');
  editButton.addEventListener('click', () => {
    if (selectedObject) {
      selectedObject.scale.set(2, 2, 2);  // Example edit: make it larger
    }
  });
}
