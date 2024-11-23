import * as THREE from 'three';

export function createHandDrawnOutline(mesh, color = 0x000000, thickness = 1) {
  const edgesGeometry = new THREE.EdgesGeometry(mesh.geometry);
  const outlineMaterial = new THREE.LineBasicMaterial({ color: color, linewidth: thickness });
  const outline = new THREE.LineSegments(edgesGeometry, outlineMaterial);
  outline.scale.set(1.01, 1.01, 1.01);
  outline.renderOrder = 1;
  outline.raycast = () => {};  // Disable raycasting
  mesh.add(outline);
  return outline;
}
