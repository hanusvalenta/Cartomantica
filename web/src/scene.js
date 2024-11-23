import * as THREE from 'three';
import { setupControls, setupUI } from './controls.js';

export function initCamera(camera) {
  // Set camera aspect ratio based on the window's current dimensions
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

export function setupScene() {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    75, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
  );
  camera.position.z = 5;

  // Initialize camera properties
  initCamera(camera);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.shadowMap.enabled = true; // Enable shadows

  // Lighting setup
  const ambientLight = new THREE.AmbientLight(0x404040); // Ambient light
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true; // Enable shadow for the light
  scene.add(directionalLight);

  // Ground setup for shadow
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = - Math.PI / 2;
  ground.position.y = -5;
  ground.receiveShadow = true;
  scene.add(ground);

  // Set up the UI and controls
  setupUI(scene);
  setupControls(camera, scene);

  // Resize event listener to adjust the camera aspect ratio
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    initCamera(camera); // Reinitialize camera when window resizes
  });

  // Animation loop to render the scene
  const animate = () => {
    requestAnimationFrame(animate);

    // Update objects or perform any other animation logic
    if (scene.children) {
      scene.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.y += 0.01; // Example rotation for all meshes
        }
      });
    }

    renderer.render(scene, camera);
  };

  animate();
}
