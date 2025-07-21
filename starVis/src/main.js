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
  labels: starLabels,
  dispose: disposeStarField,
} = createStarField(starMap, {
  radius: 100,
  labelMag: 3,
});

scene.add(starField);

//Load constellations
const edges = await loadConstellationEdges();
const {
  group: constellations,
  dispose: disposeConstellations,
  labels: constellationLabels,
} = createConstellations(edges, starMap);

scene.add(constellations);

// buildUI creates the checkboxes for controlling visibility
// in general, it makes dom elements
buildUI({
  starLabels,
  constellationLabels,
  constellationsGroup: constellations,
});

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
