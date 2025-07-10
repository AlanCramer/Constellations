// three-scene.js
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

  const frustumSize = opts.frustumSize ?? 50;
  const aspect = container.clientWidth / container.clientHeight;

  // --- Scene & camera -------------------------------------------------------
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    (-frustumSize * aspect) / 2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    -frustumSize / 2,
    0.1,
    1000
  );
  camera.position.set(0, 0, 0);
  camera.lookAt(0, 0, 1);

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
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.rotateSpeed = 0.4;
  controls.target.set(0, 0, -1);
  controls.update();

  // --- Resize handler -------------------------------------------------------
  function handleResize() {
    const aspect = container.clientWidth / container.clientHeight;
    camera.left = (-frustumSize * aspect) / 2;
    camera.right = (frustumSize * aspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
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
