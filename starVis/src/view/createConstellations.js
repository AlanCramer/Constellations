import * as THREE from "three";
import { CONSTELLATION_NAMES } from "../../constellation-names.js";
import { CSS2DObject } from "three-stdlib";
import { raDecToVec3 } from "../utils/utils.js"; //Converts star coordinates

export function createConstellations(edges, starMap, opts = {}) {
  const radius = opts.radius ?? 100;
  const group = new THREE.Group();
  const labelObjects = [];

  const centerMap = new Map(); // for constellation label positioning
  const constellationMap = new Map(); // for hover highlight

  // First, compute positions for all stars if not already set
  for (const star of starMap.values()) {
    if (!star.pos) {
      star.pos = raDecToVec3(star.ra, star.dec, radius).multiplyScalar(-1);
    }
  }

  // === DRAW CONSTELLATION LINES ===
  //each edge is a connection between two stars, this gets the first and second star, 
  //and then creates a line between them
  // it skips if the stars doesn't exist
  for (const edge of edges) {
    const s1 = starMap.get(edge.star1);
    const s2 = starMap.get(edge.star2);
    if (!s1 || !s2) continue; 

    const geometry = new THREE.BufferGeometry().setFromPoints([s1.pos, s2.pos]);
    const material = new THREE.LineBasicMaterial({ color: 0x88ccff }); //this is the color of the constellation names...? (the color is light blue)
    const line = new THREE.LineSegments(geometry, material); //creates the constellation lines. 

    line.userData.constellation = edge.name; //stores constellation name on line.
    line.userData.edge = edge; // Store edge data for view switching 

    // Group lines by constellation name and their edges
    if (!constellationMap.has(edge.name)) {
      constellationMap.set(edge.name, []);
    }
    constellationMap.get(edge.name).push(line);

    group.add(line);

    // Midpoint for constellation label positioning
    const mid = new THREE.Vector3().addVectors(s1.pos, s2.pos).multiplyScalar(0.5);
    const mids = centerMap.get(edge.name) ?? [];
    mids.push(mid);
    centerMap.set(edge.name, mids);
  }

  // === CONSTELLATION NAME LABELS ===
  for (const [name, mids] of centerMap) { //for each constellation, 
    const center = new THREE.Vector3(); //calculate the center point
    mids.forEach((v) => center.add(v)); //so add all midpoints
    center.divideScalar(mids.length); //average them...?

    const div = document.createElement("div"); //div: creates HTML element
    div.className = "constellation-label"; //CSS class for styling
    div.textContent = CONSTELLATION_NAMES[name] || name; // ORI -> Orion

    const label = new CSS2DObject(div); //makes a 3d label
    label.position.copy(center.normalize().multiplyScalar(radius * 1.02));
    group.add(label);
    labelObjects.push(label); //stores the label in the labelObjects array, for toggle
  }

  // === Hover highlighting ===
  group.highlightConstellation = function (name, color = 0xffcc00) {
    const lines = constellationMap.get(name) ?? [];
    for (const line of lines) {
      line.material.color.setHex(color);
    }
  };

  group.resetHighlight = function () {
    for (const lines of constellationMap.values()) {
      for (const line of lines) {
        line.material.color.setHex(0xffffff); // Reset to white (default color)
      }
    }
  };

  // Function to switch between inside and outside view
  function switchConstellationView(isInsideView) {
    // Update constellation line positions
    for (const child of group.children) {
      if (child.isLineSegments) {
        const edge = child.userData.edge;
        if (edge) {
          const s1 = starMap.get(edge.star1);
          const s2 = starMap.get(edge.star2);
          if (s1 && s2) {
            const pos1 = isInsideView ? s1.posInside : s1.posOutside;
            const pos2 = isInsideView ? s2.posInside : s2.posOutside;
            child.geometry.setFromPoints([pos1, pos2]);
          }
        }
      }
    }
    
    // Update constellation label positions
    for (const [name, mids] of centerMap) {
      // Find the label for this constellation
      const label = labelObjects.find(l => l.element.textContent === (CONSTELLATION_NAMES[name] || name));
      if (label) {
        // Recalculate center position using current view positions
        const newCenter = new THREE.Vector3();
        let edgeCount = 0;
        
        // Find all edges for this constellation
        for (const child of group.children) {
          if (child.isLineSegments && child.userData.edge && child.userData.edge.name === name) {
            const edge = child.userData.edge;
            const s1 = starMap.get(edge.star1);
            const s2 = starMap.get(edge.star2);
            if (s1 && s2) {
              const pos1 = isInsideView ? s1.posInside : s1.posOutside;
              const pos2 = isInsideView ? s2.posInside : s2.posOutside;
              const mid = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);
              newCenter.add(mid);
              edgeCount++;
            }
          }
        }
        
        if (edgeCount > 0) {
          newCenter.divideScalar(edgeCount);
          // Update label position
          label.position.copy(newCenter.normalize().multiplyScalar(radius * 1.02));
        }
      }
    }
  }

  function dispose() {
    for (const child of group.children) {
      if (child.isLineSegments) {
        child.geometry.dispose();
        child.material.dispose();
      }
    }
  }

  return { group, dispose, labels: labelObjects, switchConstellationView };
}
