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

import { loadStarSearchIndex, searchStars, getStarByName } from "../search/starSearch.js";
import { CONSTELLATION_NAMES } from "../../constellation-names.js";

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


<hr style="margin: 10px 0; border: 1px solid rgba(255,255,255,0.3);">
<label>Search Stars: <input type="text" id="starSearch" placeholder="Type star name..." style="width: 150px; margin-left: 5px;"></label><br>
<div id="searchResults" style="margin-top: 5px; max-height: 100px; overflow-y: auto;"></div>

<hr style="margin: 10px 0; border: 1px solid rgba(255,255,255,0.3);">
<label>Search Constellations: <input type="text" id="constellationSearch" placeholder="Type constellation name..." style="width: 150px; margin-left: 5px;"></label><br>
<div id="constellationSearchResults" style="margin-top: 5px; max-height: 100px; overflow-y: auto;"></div>
`;


  document.body.appendChild(panel);


  const searchInput = panel.querySelector("#starSearch");
  const searchResults = panel.querySelector("#searchResults");
  const constellationSearchInput = panel.querySelector("#constellationSearch");
  const constellationSearchResults = panel.querySelector("#constellationSearchResults");

  function displaySearchResults(results) {
    if (results.length === 0) {
        searchResults.innerHTML = "<div style='color: #ff6b6b;'>No stars found </div>";
        return;
    }
    
    searchResults.innerHTML = results.map(star => 
        `<div style="cursor: pointer; padding: 2px; border-bottom: 1px solid rgba(255,255,255,0.2);" 
             onclick="zoomToStar('${star.name}')">
            ${star.name} (Mag: ${star.mag})
        </div>`
    ).join('');
  }

  function displayConstellationSearchResults(results) {
    if (results.length === 0) {
        constellationSearchResults.innerHTML = "<div style='color: #ff6b6b;'>No constellations found</div>";
        return;
    }
    
    constellationSearchResults.innerHTML = results.map(constellation => 
        `<div style="cursor: pointer; padding: 2px; border-bottom: 1px solid rgba(255,255,255,0.2);" 
             onclick="console.log('Clicked constellation:', '${constellation.abbr}'); zoomToConstellation('${constellation.abbr}')">
            ${constellation.fullName}
        </div>`
    ).join('');
  }

  function searchConstellations(query, maxResults = 5) {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const queryLower = query.toLowerCase().trim();
    const results = [];

    // Search through constellation names (both abbreviations and full names)
    for (const [abbr, fullName] of Object.entries(CONSTELLATION_NAMES)) {
        const abbrLower = abbr.toLowerCase();
        const fullNameLower = fullName.toLowerCase();
        
        // Check if query matches abbreviation or full name
        if (abbrLower.includes(queryLower) || fullNameLower.includes(queryLower)) {
            results.push({ abbr, fullName });
            if (results.length >= maxResults) break;
        }
    }
    
    return results;
  }

  // Load search index when UI is built
  loadStarSearchIndex();



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


  // Add search functionality
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    if (query.length >= 2) {
        const results = searchStars(query, 5);
        displaySearchResults(results);
    } else {
        searchResults.innerHTML = "";
    }
  });

  // Add constellation search functionality
  constellationSearchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    if (query.length >= 2) {
        const results = searchConstellations(query, 5);
        displayConstellationSearchResults(results);
    } else {
        constellationSearchResults.innerHTML = "";
    }
  });

}  // This closes the buildUI function