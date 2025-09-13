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
  <label><input type="checkbox" id="chk-autoRotate" > Auto-rotate Sphere</label>
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

  // ---- Set initial visibility based on checkbox state --------------------
  // Set initial visibility to match unchecked state of checkboxes
  setVisible(hrLabels, false);
  setVisible(nameLabels, false);
  // Constellations checkbox is checked by default, so keep it visible

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

panel.querySelector("#chk-autoRotate").addEventListener("change", (e) => {
  controls.autoRotate = e.target.checked;
});


}
