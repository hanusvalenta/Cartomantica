import * as THREE from 'three';

let selectedObject = null;

export function setupControls(camera, scene) {
  // Handle manual controls for camera movement
  window.addEventListener('keydown', (event) => {
    const key = event.key;
    switch (key) {
      case 'w':
        camera.position.z -= 1;
        break;
      case 's':
        camera.position.z += 1;
        break;
      case 'a':
        camera.position.x -= 1;
        break;
      case 'd':
        camera.position.x += 1;
        break;
      case 'r':
        if (selectedObject) {
          selectedObject.rotation.x += 0.1;
        }
        break;
      case 't':
        if (selectedObject) {
          selectedObject.scale.x += 0.1;
          selectedObject.scale.y += 0.1;
          selectedObject.scale.z += 0.1;
        }
        break;
      case 'y':
        if (selectedObject) {
          selectedObject.scale.x -= 0.1;
          selectedObject.scale.y -= 0.1;
          selectedObject.scale.z -= 0.1;
        }
        break;
      case 'Delete':
        if (selectedObject) {
          scene.remove(selectedObject);
          selectedObject = null;
        }
        break;
      default:
        break;
    }
  });

  // Event listener to select an object by clicking on it
  window.addEventListener('click', (event) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Convert mouse coordinates to normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
      selectedObject = intersects[0].object;
      console.log('Selected object:', selectedObject);
    }
  });
}

export function setupUI(scene) {
  const spawnButton = document.getElementById('spawnButton');
  spawnButton.addEventListener('click', () => {
    // Logic to spawn objects manually
    spawnRandomObject(scene);
  });

  const editButton = document.getElementById('editButton');
  editButton.addEventListener('click', () => {
    if (selectedObject) {
      // Logic for editing the selected object (scale/rotate)
      selectedObject.scale.set(2, 2, 2);  // Example edit: make it larger
      selectedObject.rotation.x += 0.5;  // Example edit: rotate object
    }
  });

  const deleteButton = document.getElementById('deleteButton');
  deleteButton.addEventListener('click', () => {
    if (selectedObject) {
      scene.remove(selectedObject);
      selectedObject = null;
    }
  });
}

function spawnRandomObject(scene) {
  // Function to spawn random objects (could be customized further)
  const loader = new THREE.GLTFLoader();
  const randomModelIndex = Math.floor(Math.random() * 2); // Assuming 2 models in objectData

  const objectData = [
    { modelUrl: 'models/cube.glb', name: 'Cube' },
    { modelUrl: 'models/sphere.glb', name: 'Sphere' }
  ];

  const model = objectData[randomModelIndex];
  loader.load(model.modelUrl, (gltf) => {
    const object = gltf.scene;
    object.position.set(
      Math.random() * 20 - 10, 
      5, 
      Math.random() * 20 - 10
    );
    object.scale.set(1, 1, 1);
    object.castShadow = true;
    object.receiveShadow = true;
    scene.add(object);
    console.log('Spawned object:', object);
  });
}
