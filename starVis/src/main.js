
//initThreeScene is a function that creates the scene, camera, renderers, and controls. Creates 3D world!
import { initThreeScene } from "./view/three-scene.js";

//loadstarmap is a function that reads the csv and creates a 3D map of star data. (utils is used here to make 3D)
import { loadStarMap } from "./loaders/stars.js";

//createStarField is a function that creates the star field. It calls starmap from stars.js? (CHLOE how is this different from loadstarmap?)
import { createStarField } from "./view/createStarField.js";

//function that reads constellation line (edges) data from csv and creates a map of edges. 
import { loadConstellationEdges } from "./loaders/constellations.js";

//function that makes the constellation lines.
import { createConstellations } from "./view/createConstellations.js";

//function that builds the UI.
import { buildUI } from "./dom/uiControls.js";

// This is the entire three.js library. (creates 3D graphics!)
import * as THREE from "three";

//A container is the div (html element) where the 3D scene will be rendered. 
const container = document.getElementById("viewer"); //this finds the HTML element with the ID "viewer"
//CHLOE --but where does it look to find the HTML element with the ID "viewer"? 
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
  radius: 100, //CHLOE --these don't seem to change anything in the UI. 
  labelMag: 3, //CHLOE --these don't seem to change anything in the UI. 
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


//CHLOE turning off inside view for now. (testing)
// Set initial view to inside view (planetarium) after everything is set up
switchStarView(false);
switchConstellationView(false);
// Set up camera and controls for inside view (matching uiControls.js settings)
/*camera.position.set(0, 0, 0);
controls.target.set(0, 0, 0);
controls.minDistance = 1;
controls.maxDistance = 99; // Match uiControls.js
controls.enableZoom = true; // Match uiControls.js - enable zoom!
controls.enablePan = true;
controls.rotateSpeed = 0.5; // Match uiControls.js
controls.update();*/

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
