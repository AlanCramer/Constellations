import { loadStarMap } from "./loaders/stars.js";
import { initThreeScene } from "./view/three-scene.js";
import { createStarField } from "./view/createStarField.js";
import { loadConstellationEdges } from "./loaders/constellations.js";
import { createConstellations } from "./view/createConstellations.js";
import { buildUI } from "./dom/uiControls.js";
import * as THREE from "three";


const container = document.getElementById("viewer");
const { scene, camera, renderer, labelRenderer, controls } =
  initThreeScene(container);

//Raycaster setup
const raycaster = new THREE.Raycaster();
raycaster.linePrecision = 0.5;
const mouse = new THREE.Vector2();

//Load stars
const starMap = await loadStarMap();

const {
  group: starField,
  hrLabels,
  nameLabels,
  dispose: disposeStarField,
  switchStarView,
} = createStarField(starMap, {
  radius: 100,
  labelMag: 3,
});

window.hrLabels = hrLabels;
window.nameLabels = nameLabels;

scene.add(starField);

//Load constellations from constellations.js 
const edges = await loadConstellationEdges();
const {
  group: constellations,
  labels: constellationNames,
  dispose: disposeConstellations,
  switchConstellationView,
} = createConstellations(edges, starMap);

scene.add(constellations);

// buildUI creates the checkboxes for controlling visibility
// in general, it makes dom elements
buildUI({
  hrLabels,
  nameLabels,
  constellationsGroup: constellations,
  constellationNames,
  controls,
  camera,
  switchStarView,
  switchConstellationView,
});

// Set initial view to inside view (planetarium) after everything is set up
switchStarView(true);
switchConstellationView(true);
// Set up camera and controls for inside view (matching uiControls.js settings)
camera.position.set(0, 0, 0);
controls.target.set(0, 0, 0);
controls.minDistance = 1;
controls.maxDistance = 99; // Match uiControls.js
controls.enableZoom = true; // Match uiControls.js - enable zoom!
controls.enablePan = true;
controls.rotateSpeed = 0.5; // Match uiControls.js
controls.update();

// Track mouse position
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Animate and highlight
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(constellations.children, true);

  // Reset all to white
  constellations.children.forEach((line) => {
    if (line.material) line.material.color.set(0xffffff);
  });

  // Highlight intersected one and log it
  if (intersects.length > 0) {
  const hit = intersects[0].object;
  const constellationName = hit.userData.constellation;

  constellations.children.forEach((line) => {
    if (line.userData.constellation === constellationName) {
      line.material.color.set(0xffa500); // highlight
    }
  });

  console.log("HIT CONSTELLATION:", constellationName);
}
  }
animate();
