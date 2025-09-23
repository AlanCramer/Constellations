//This is a utility function that converts RIGHT ASCENSION and DECLINATION to a vector3. 
//Right Ascension is like longitude (vertical) and Declination is like latitude (horizontal). 
//Converts ra and dec into a 3D space. 

//Three.js needs 3D coordinates (x, y, z) to display objects in the scene. 


import * as THREE from "three";

export function raDecToVec3(raDeg, decDeg, radius = 100) { //CHLOE --changing this radius doesn't seem to change anything in the UI. 
  const ra = THREE.MathUtils.degToRad(raDeg);
  const dec = THREE.MathUtils.degToRad(decDeg);
  const x = radius * Math.cos(dec) * Math.cos(ra);
  const y = radius * Math.sin(dec);
  const z = radius * Math.cos(dec) * Math.sin(ra);
  return new THREE.Vector3(x, y, z);
}
