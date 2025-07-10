import { loadStarMap } from "./loaders/stars.js";
import { initThreeScene } from "./view/three-scene.js";
import { createStarField } from "./view/createStarField.js";
import { loadConstellationEdges } from "./loaders/constellations.js";
import { createConstellations } from "./view/createConstellations.js";
import { buildUI } from "./dom/uiControls.js";

const container = document.getElementById("viewer");
const { scene, camera, renderer, labelRenderer, controls } =
  initThreeScene(container);

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

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
animate();
