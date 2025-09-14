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

  const hrLabels = [];
  const nameLabels = [];

  // Loop through each star in the starMap
  for (const star of starMap.values()) {
    if (isNaN(star.ra) || isNaN(star.dec) || isNaN(star.mag)) continue;

    // Cache position for the star
    const pos = star.pos ?? (star.pos = raDecToVec3(star.ra, star.dec, radius).multiplyScalar(-1));
    positions.push(pos.x, pos.y, pos.z);
    colors.push(1, 1, 1); // Default color is white

    // Create HR name label if HR is available and the toggle is on
    if (star.hr) {
      const div = document.createElement("div");
      div.className = "hr-star-label";
      div.textContent = `HR ${star.hr}`;
      const label = new CSS2DObject(div);
      label.position.copy(pos.clone().normalize().multiplyScalar(radius + 4));
      label.visible = false; // Start with labels hidden
      group.add(label);
      hrLabels.push(label);
    } 

    // Create Star name label if the name is available and the toggle is on
    if (star.name) {
      const div = document.createElement("div");
      div.className = "star-name";
      div.textContent = star.name;
      const label = new CSS2DObject(div);
      label.position.copy(pos.clone().normalize().multiplyScalar(radius + 6));
      label.visible = false; // Start with labels hidden
      group.add(label);
      nameLabels.push(label);
    }
  }

  // Create the points for the star field
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 4,
    vertexColors: true,
    sizeAttenuation: false,
  });

  const points = new THREE.Points(geometry, material);
  group.add(points);

  // Function to switch between inside and outside view
  function switchStarView(isInsideView) {
    const positions = geometry.attributes.position.array;
    let index = 0;
    
    for (const star of starMap.values()) {
      if (isNaN(star.ra) || isNaN(star.dec) || isNaN(star.mag)) continue;
      
      const pos = isInsideView ? star.posInside : star.posOutside;
      positions[index++] = pos.x;
      positions[index++] = pos.y;
      positions[index++] = pos.z;
    }
    
    geometry.attributes.position.needsUpdate = true;
  }

  // Function to dispose of geometry and material
  function dispose() {
    geometry.dispose();
    material.dispose();
  }

  // Return the result with proper closure
  return { group, hrLabels, nameLabels, dispose, switchStarView };
}
