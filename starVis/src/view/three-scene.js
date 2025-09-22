// three-scene.js
//This is the scene bootstrap. 
//It creates the scene, camera, renderers, and controls.
//If we didn't have this we wouldn't have a 3D space!
 


import * as THREE from "three";
import { OrbitControls, CSS2DRenderer } from "three-stdlib";

/**
 * Creates scene, camera, renderers, and controls.
 * @param {HTMLElement} container  The DOM node you’ll attach canvases to.
 * @param {Object} [opts]
 * @param {number} [opts.frustumSize=50]
 * @returns {{scene, camera, renderer, labelRenderer, controls, dispose}}
 */
export function initThreeScene(container, opts = {}) {
  if (!container) throw new Error("initThreeScene: container is required");

  const frustumSize = opts.frustumSize ?? 300; //determines where camera stars, zooms in and out. 
  const aspect = container.clientWidth / container.clientHeight;

  // --- Scene & camera -------------------------------------------------------
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.set(0, 0, 100); // Start outside like test-sphere.html
  camera.lookAt(0, 0, 0); // Look at center

  // --- WebGL renderer -------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // --- CSS2D renderer (labels) ---------------------------------------------
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(container.clientWidth, container.clientHeight);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = 0;
  labelRenderer.domElement.style.pointerEvents = "none";
  container.appendChild(labelRenderer.domElement);

  // --- Orbit controls -------------------------------------------------------
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.5;
  controls.zoomSpeed = 1.0;
  controls.panSpeed = 0.8;
  controls.target.set(0, 0, 0); // Center the target at origin
  controls.minDistance = 50;
  controls.maxDistance = 280;
  controls.enableZoom = true;
  controls.enablePan = false;
  // Auto-rotation settings
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.3; // Slow, smooth rotation
  controls.update();

  // --- Resize handler -------------------------------------------------------
  function handleResize() {
    const aspect = container.clientWidth / container.clientHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    labelRenderer.setSize(container.clientWidth, container.clientHeight);
  }
  window.addEventListener("resize", handleResize);

  // --- Clean-up helper ------------------------------------------------------
  function dispose() {
    window.removeEventListener("resize", handleResize);
    controls.dispose();
    renderer.dispose();
    // Dispose any geometries/materials you add later…
  }

  return { scene, camera, renderer, labelRenderer, controls, dispose };
}
