// createStarField.js
import * as THREE from "three";
import { CSS2DObject } from "three-stdlib";
import { raDecToVec3 } from "../utils/utils.js";

/**
 * Build a THREE.Points mesh *plus* optional name-labels.
 *
 * @param {Map<number,{ra,dec,mag,name,hr}>} starMap
 * @param {object} [opts]
 * @param {number} [opts.radius=100]     Sphere radius
 * @param {number} [opts.labelMag=3.0]   Only label stars brighter than this
 * @returns {{object:THREE.Points, labels:CSS2DObject[], dispose:()=>void}}
 */
export function createStarField(starMap, opts = {}) {
  const radius = opts.radius ?? 100;
  const labelMag = opts.labelMag ?? 3.0;

  const group = new THREE.Group();
  const positions = [];
  const colors = [];
  const labels = [];

  for (const star of starMap.values()) {
    if (isNaN(star.ra) || isNaN(star.dec) || isNaN(star.mag)) continue;

    // cache vec3 on star so other layers can reuse it
    const pos =
      star.pos ??
      (star.pos = raDecToVec3(star.ra, star.dec, radius).multiplyScalar(-1));

    positions.push(pos.x, pos.y, pos.z);
    colors.push(1, 1, 1); // white; swap in per-star colour later

    // Decide whether to label
    if (star.name && !star.name.startsWith("HR") && star.mag <= labelMag) {
      const div = document.createElement("div");
      div.className = "star-label";
      div.textContent = star.name;

      const label = new CSS2DObject(div);
      label.position.copy(
        pos
          .clone()
          .normalize()
          .multiplyScalar(radius + 4)
      ); // sit just above sphere

      group.add(label);
      labels.push(label);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 4,
    vertexColors: true,
    sizeAttenuation: false,
  });

  const points = new THREE.Points(geometry, material);
  group.add(points);

  function dispose() {
    geometry.dispose();
    material.dispose();
  }

  return { group, labels, dispose };
}
