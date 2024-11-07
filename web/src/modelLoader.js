import { GLTFLoader } from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';

function spawnGLBObject(scene, folderPath, objectName) {
  const loader = new GLTFLoader();
  loader.load(
    `${folderPath}/${objectName}.glb`,
    (gltf) => {
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      model.scale.set(1, 1, 1);
      scene.add(model);
    },
    undefined,
    (error) => {
      console.error(error);
    }
  );
}

export {spawnGLBObject};
