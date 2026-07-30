import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { ArcballControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/ArcballControls.js";

const modelURL = "https://dl.dropboxusercontent.com/scl/fi/4zdgrxhnbv79g0d787hg6/camtamiya.glb?rlkey=q1k5bp5t0tupzwnk87tyihmn2&st=z7y9tqm9";

const container = document.getElementById("viewer");
let scene, camera, renderer, controls, model;

init();
animate();

function init() {
  scene = new THREE.Scene();
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
  camera.position.set(0, 1.2, 3);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;

  container.prepend(renderer.domElement);

  setupLights();
  setupControls();
  loadModel();
}

function setupLights() {
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 1.5);
  dir.position.set(5, 10, 5);
  dir.castShadow = true;
  dir.shadow.mapSize.set(2048, 2048);
  scene.add(dir);
}

function setupControls() {
  controls = new ArcballControls(camera, renderer.domElement, null);
  controls.showZoom = false;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.rotateSpeed = 4.0;
  controls.minDistance = 0.5;
  controls.maxDistance = 20;
  controls.enableAnimations = true;
  controls.dampingFactor = 10;
  controls.maxPolarAngle = Math.PI;
}

function loadModel() {
  const loader = new GLTFLoader();
  loader.load(
    modelURL,
    (gltf) => {
      model = gltf.scene;
      model.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
        }
      });
      scene.add(model);
      centerAndFrameModel(model);
    },
    undefined,
    (error) => {
      console.error("Model failed to load", error);
    }
  );
}

function centerAndFrameModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  const size = box.getSize(new THREE.Vector3()).length();
  const distance = size * 1.5;
  camera.position.set(0, 0, distance);
  camera.lookAt(0, 0, 0);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});
