import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

// Your GLB file
const modelURL = "https://dl.dropboxusercontent.com/scl/fi/4zdgrxhnbv79g0d787hg6/camtamiya.glb?rlkey=q1k5bp5t0tupzwnk87tyihmn2&st=z7y9tqm9";

// Canvas element
const canvas = document.getElementById("viewer");

// Log canvas size for debugging
console.log("Canvas size:", canvas.clientWidth, canvas.clientHeight);

let scene, camera, renderer, controls;

init();
animate();

function init() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000);
  camera.position.set(0, 1, 3);

  // Renderer (using canvas directly)
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });

  renderer.setClearColor(0x222222, 1); // dark gray background
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 1.5);
  dir.position.set(5, 10, 5);
  scene.add(dir);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Debug cube (proves rendering works)
  const testGeo = new THREE.BoxGeometry(1, 1, 1);
  const testMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const testCube = new THREE.Mesh(testGeo, testMat);
  scene.add(testCube);

  // Load GLB model
  loadModel();
}

function loadModel() {
  const loader = new GLTFLoader();
  loader.load(
    modelURL,
    (gltf) => {
      const model = gltf.scene;
      scene.add(model);

      // Compute bounding box
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Center model
      model.position.sub(center);

      // Frame camera
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      const cameraZ = Math.abs(maxDim / Math.sin(fov / 2));

      camera.position.set(0, maxDim * 0.5, cameraZ);
      camera.lookAt(0, 0, 0);

      controls.update();
    },
    undefined,
    (err) => console.error("Model failed to load:", err)
  );
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});
