import * as THREE from "three";
import { CONSTELLATION_NAMES } from "../../constellation-names.js";
import { CSS2DObject } from "three-stdlib";
import { raDecToVec3 } from "../utils/utils.js";

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
  for (const edge of edges) {
    const s1 = starMap.get(edge.star1);
    const s2 = starMap.get(edge.star2);
    if (!s1 || !s2) continue;

    const geometry = new THREE.BufferGeometry().setFromPoints([s1.pos, s2.pos]);
    const material = new THREE.LineBasicMaterial({ color: 0x88ccff });
    const line = new THREE.LineSegments(geometry, material);

    line.userData.constellation = edge.name;

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
  for (const [name, mids] of centerMap) {
    const center = new THREE.Vector3();
    mids.forEach((v) => center.add(v));
    center.divideScalar(mids.length);

    const div = document.createElement("div");
    div.className = "constellation-label";
    div.textContent = CONSTELLATION_NAMES[name] || name;

    const label = new CSS2DObject(div);
    label.position.copy(center.normalize().multiplyScalar(radius * 1.02));
    group.add(label);
    labelObjects.push(label);
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
        line.material.color.setHex(0x88ccff);
      }
    }
  };

  function dispose() {
    for (const child of group.children) {
      if (child.isLineSegments) {
        child.geometry.dispose();
        child.material.dispose();
      }
    }
  }

  return { group, dispose, labels: labelObjects };
}
