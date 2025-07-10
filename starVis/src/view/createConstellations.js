import * as THREE from "three";
import { CONSTELLATION_NAMES } from "../../constellation-names.js";
import { CSS2DObject } from "three-stdlib";

export function createConstellations(edges, starMap, opts = {}) {
  const radius = opts.radius ?? 100;
  const group = new THREE.Group();
  const labelObjects = [];

  // Ensure star.pos exists (as before)
  for (const star of starMap.values()) {
    if (!star.pos) {
      star.pos = raDecToVec3(star.ra, star.dec, radius).multiplyScalar(-1);
    }
  }

  // Map<abr, { positions: number[], line: THREE.LineSegments }>
  const byName = new Map();

  for (const edge of edges) {
    const s1 = starMap.get(edge.star1);
    const s2 = starMap.get(edge.star2);
    if (!s1 || !s2) continue;

    let bucket = byName.get(edge.name);
    if (!bucket) {
      bucket = { positions: [] };
      byName.set(edge.name, bucket);
    }
    bucket.positions.push(
      s1.pos.x,
      s1.pos.y,
      s1.pos.z,
      s2.pos.x,
      s2.pos.y,
      s2.pos.z
    );
  }

  // Convert each bucket into a LineSegments mesh + label
  for (const [name, { positions }] of byName) {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );

    const mat = new THREE.LineBasicMaterial({ color: 0x88ccff });
    const lineSeg = new THREE.LineSegments(geom, mat);
    group.add(lineSeg);

    // Label at average position (rough)
    const center = new THREE.Vector3();
    for (let i = 0; i < positions.length; i += 3) {
      center.x += positions[i];
      center.y += positions[i + 1];
      center.z += positions[i + 2];
    }
    center.divideScalar(positions.length / 3);

    const div = document.createElement("div");
    div.className = "constellation-label";
    div.textContent = CONSTELLATION_NAMES[name] || name;
    const label = new CSS2DObject(div);
    label.position.copy(center.normalize().multiplyScalar(radius * 1.02));
    group.add(label);
    labelObjects.push(label);
  }

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
