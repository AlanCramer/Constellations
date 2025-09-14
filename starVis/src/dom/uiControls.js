// uiControls.js
/**
 * Build the control panel and wire visibility toggles.
 *
 * @param {Object} targets
 * @param {CSS2DObject[]} targets.hrLabels
 * @param {CSS2DObject[]} targets.nameLabels
 * @param {THREE.Object3D} targets.constellationsGroup
 * @param {CSS2DObject[]} targets.constellationNames
 */

export let useHRNames = false;
export let useStarNames = false;

export function buildUI({
  hrLabels,
  nameLabels,
  constellationsGroup,
  constellationNames,
  controls,
  camera,
  switchStarView,
  switchConstellationView,
}) {
  // ---- Create DOM ---------------------------------------------------------
  const panel = document.createElement("div");
  panel.id = "controls";
  panel.style.cssText = `
      position: absolute; top: 1rem; left: 1rem;
      background: rgba(48, 35, 115, 0.6); color:#fff; padding:.5rem .75rem;
      font-family: system-ui, sans-serif; font-size: 14px; border-radius: 6px;
    `;

  panel.innerHTML = `
  <label><input type="checkbox" id="chk-hrlabels" > HR Star Labels</label><br>
  <label><input type="checkbox" id="chk-starNames" > Star Names</label><br>
  <label><input type="checkbox" id="chk-constellations" checked> Constellation Lines</label><br>
  <label><input type="checkbox" id="chk-constellation-names" checked> Constellation Names</label><br>
  <label><input type="checkbox" id="chk-insideView" checked> Inside View</label><br>
  <label><input type="checkbox" id="chk-autoRotate" > Auto-rotate Sphere</label><br>
  <label>Rotation Speed: <input type="range" id="rotationSpeed" min="0.1" max="3.0" step="0.1" value="0.5" style="width: 100px;"></label>
`;


  document.body.appendChild(panel);

  // ---- Wiring helpers -----------------------------------------------------
  function setVisible(objs, on) {
    if (Array.isArray(objs)) {
      objs.forEach((o) => (o.visible = on));
    } else if (objs) {
      objs.visible = on;
    }
  }

  // ---- View switching function -------------------------------------------
  function switchView(isInsideView) {
    if (isInsideView) {
      // Inside view: camera inside the sphere (from working test-sphere.html)
      camera.position.set(0, 0, 0);
      controls.target.set(0, 0, 0); // YES ALL AT 0, 0, 0 is the CENTER
      controls.minDistance = 1;
      controls.maxDistance = 99; // CHLOE this doesn't seem to change when I adjust. 
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.rotateSpeed = 0.5;
      
    } else {
      // Outside view: camera outside the sphere (from working test-sphere.html)
      camera.position.set(0, 0, 100);
      controls.target.set(0, 0, 0);
      controls.minDistance = 60;
      controls.maxDistance = 300;
      controls.enableZoom = true;
      controls.enablePan = false;
      controls.rotateSpeed = 0.5;
    }
    controls.update();
  }

  // ---- Set initial visibility based on checkbox state --------------------
  // Set initial visibility to match unchecked state of checkboxes
  setVisible(hrLabels, false);
  setVisible(nameLabels, false);
  // Constellations checkbox is checked by default, so keep it visible
  
  // ---- Set initial view to inside view (planetarium) --------------------
  // This will be called after buildUI returns to ensure everything is set up

  // ---- Event listeners ----------------------------------------------------
 panel.querySelector("#chk-hrlabels").addEventListener("change", (e) => {
  setVisible(hrLabels, e.target.checked);
});

panel.querySelector("#chk-starNames").addEventListener("change", (e) => {
  setVisible(nameLabels, e.target.checked);
});

panel.querySelector("#chk-constellations").addEventListener("change", (e) => {
  setVisible(constellationsGroup, e.target.checked);
});

panel.querySelector("#chk-constellation-names").addEventListener("change", (e) => {
  setVisible(constellationNames, e.target.checked);
});

panel.querySelector("#chk-insideView").addEventListener("change", (e) => {
  switchView(e.target.checked);
});

panel.querySelector("#chk-autoRotate").addEventListener("change", (e) => {
  controls.autoRotate = e.target.checked;
});

panel.querySelector("#rotationSpeed").addEventListener("input", (e) => {
  controls.autoRotateSpeed = parseFloat(e.target.value);
});


}
