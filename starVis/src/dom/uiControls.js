// uiControls.js
/**
 * Build the control panel and wire visibility toggles.
 *
 * @param {Object} targets
 * @param {CSS2DObject[]} targets.starLabels
 * @param {CSS2DObject[]} targets.constellationLabels
 * @param {THREE.Object3D} targets.constellationsGroup
 */
export function buildUI({
  starLabels,
  constellationLabels,
  constellationsGroup,
}) {
  // ---- Create DOM ---------------------------------------------------------
  const panel = document.createElement("div");
  panel.id = "controls";
  panel.style.cssText = `
      position: absolute; top: 1rem; left: 1rem;
      background: rgba(0,0,0,.6); color:#fff; padding:.5rem .75rem;
      font-family: system-ui, sans-serif; font-size: 14px; border-radius: 6px;
    `;

  panel.innerHTML = `
      <label><input type="checkbox" id="chk-starlabels"          checked> Star labels</label><br>
      <label><input type="checkbox" id="chk-constellationlabels" checked> Constellation labels</label><br>
      <label><input type="checkbox" id="chk-constellations"      checked> Constellation lines</label>
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

  // ---- Event listeners ----------------------------------------------------
  panel.querySelector("#chk-starlabels").addEventListener("change", (e) => {
    setVisible(starLabels, e.target.checked);
  });

  panel
    .querySelector("#chk-constellationlabels")
    .addEventListener("change", (e) => {
      setVisible(constellationLabels, e.target.checked);
    });

  panel.querySelector("#chk-constellations").addEventListener("change", (e) => {
    setVisible(constellationsGroup, e.target.checked);
  });
}
