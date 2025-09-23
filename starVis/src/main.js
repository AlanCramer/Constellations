
//initThreeScene is a function that creates the scene, camera, renderers, and controls. Creates 3D world!
import { initThreeScene } from "./view/three-scene.js";

//loadstarmap is a function that reads the csv and creates a 3D map of star data. (utils is used here to make 3D)
import { loadStarMap } from "./loaders/stars.js";

//createStarField is a function that creates the star field. It calls starmap from stars.js? (CHLOE how is this different from loadstarmap?)
import { createStarField } from "./view/createStarField.js";

//function that reads constellation line (edges) data from csv and creates a map of edges. 
import { loadConstellationData } from "./loaders/constellations.js";

//function that makes the constellation lines.
import { createConstellations } from "./view/createConstellations.js";

//function that builds the UI.
import { buildUI } from "./dom/uiControls.js";

// This is the entire three.js library. (creates 3D graphics!)
import * as THREE from "three";

//A container is the div (html element) where the 3D scene will be rendered. 
const container = document.getElementById("viewer"); //this finds the HTML element with the ID "viewer"
//CHLOE --but where does it look to find the HTML element with the ID "viewer"? 
const { scene, camera, renderer, labelRenderer, controls } =
  initThreeScene(container);

//Raycaster setup
const raycaster = new THREE.Raycaster();
raycaster.linePrecision = 0.5;
const mouse = new THREE.Vector2();

//Load stars
const starMap = await loadStarMap();

const {
  group: starField,
  hrLabels,
  nameLabels,
  dispose: disposeStarField,
  switchStarView,
} = createStarField(starMap, {
  radius: 100, //CHLOE --these don't seem to change anything in the UI. 
  labelMag: 3, //CHLOE --these don't seem to change anything in the UI. 
});

window.hrLabels = hrLabels;
window.nameLabels = nameLabels;

scene.add(starField);

// Create a transparent sphere for the star field
const sphereGeometry = new THREE.SphereGeometry(100, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ 
  transparent: true, 
  opacity: 0.05,
  side: THREE.BackSide,
  color: 0x444444,
  depthWrite: false // Don't write to depth buffer to avoid interfering with lines
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// Make sphere globally accessible for constellation zoom effects
window.constellationSphere = sphere;

//Load constellations from constellations.js 
// Using the new loader that creates both edges array and constellation map
const { edges, constellationMap } = await loadConstellationData();

// Make constellation map globally accessible for testing
window.constellationMap = constellationMap;

// Now you have both:
// - edges: the original flat array (for backward compatibility)
// - constellationMap: new efficient map for direct constellation lookups
// Example usage: const leoData = constellationMap.get("Leo");
const {
  group: constellations,
  labels: constellationNames,
  dispose: disposeConstellations,
  switchConstellationView,
} = createConstellations(edges, starMap);

scene.add(constellations);

// buildUI creates the checkboxes for controlling visibility
// in general, it makes dom elements
buildUI({
  hrLabels,
  nameLabels,
  constellationsGroup: constellations,
  constellationNames,
  controls,
  camera,
  switchStarView,
  switchConstellationView,
});


//CHLOE turning off inside view for now. (testing)
// Set initial view to inside view (planetarium) after everything is set up
switchStarView(false);
switchConstellationView(false);
// Set up camera and controls for inside view (matching uiControls.js settings)
/*camera.position.set(0, 0, 0);
controls.target.set(0, 0, 0);
controls.minDistance = 1;
controls.maxDistance = 99; // Match uiControls.js
controls.enableZoom = true; // Match uiControls.js - enable zoom!
controls.enablePan = true;
controls.rotateSpeed = 0.5; // Match uiControls.js
controls.update();*/

// Track mouse position
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Global zoomToStar function - accessible from UI
window.zoomToStar = function(starName) {
  console.log(`Zooming to star: ${starName}`);
  
  // Find the star in the starMap
  let targetStar = null;
  for (const star of starMap.values()) {
    if (star.name && star.name.toLowerCase() === starName.toLowerCase()) {
      targetStar = star;
      break;
    }
  }
  
  if (!targetStar) {
    console.error(`Star "${starName}" not found in starMap`);
    return;
  }
  
  // Get the star's position (use the current view position)
  const isInsideView = camera.position.length() < 50; // Simple check for inside view
  const starPosition = isInsideView ? targetStar.posInside : targetStar.posOutside;
  
  // Create smooth camera animation
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  
  // Calculate target camera position (offset from star for good viewing)
  const offsetDistance = isInsideView ? 8 : 40; // Closer for inside view, farther for outside
  const direction = starPosition.clone().normalize();
  const targetPosition = starPosition.clone().add(direction.multiplyScalar(offsetDistance));
  
  // Animation parameters
  const duration = 3000; // 2 seconds
  const startTime = Date.now();
  
  function animateCamera() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Use easing function for smooth animation
    const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
    
    // Interpolate camera position
    camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
    
    // Interpolate camera target (look at the star)
    controls.target.lerpVectors(startTarget, starPosition, easeProgress);
    
    controls.update();
    
    if (progress < 1) {
      requestAnimationFrame(animateCamera);
    } else {
      console.log(`Successfully zoomed to ${starName}`);
    }
  }
  
  animateCamera();
};

// Global zoomToConstellation function - accessible from UI
window.zoomToConstellation = function(constellationAbbr) {
  console.log(`Zooming to constellation: ${constellationAbbr}`);
  
  // Find all lines belonging to this constellation
  const constellationLines = [];
  const availableConstellations = new Set();
  
  constellations.children.forEach((child) => {
    if (child.userData.constellation) {
      availableConstellations.add(child.userData.constellation);
      if (child.userData.constellation === constellationAbbr) {
        constellationLines.push(child);
      }
    }
  });
  
  if (constellationLines.length === 0) {
    console.error(`Constellation "${constellationAbbr}" not found`);
    console.log(`Available constellations:`, Array.from(availableConstellations).slice(0, 10));
    return;
  }
  
  console.log(`Found ${constellationLines.length} lines for constellation ${constellationAbbr}`);
  
  // Calculate the center position of the constellation
  const center = new THREE.Vector3();
  let pointCount = 0;
  
  constellationLines.forEach((line) => {
    if (line.geometry && line.geometry.attributes.position) {
      const positions = line.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        center.add(new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]));
        pointCount++;
      }
    }
  });
  
  if (pointCount === 0) {
    console.error(`No valid points found for constellation "${constellationAbbr}"`);
    return;
  }
  
  center.divideScalar(pointCount); // Average position
  
  // Get the star's position (use the current view position)
  const isInsideView = camera.position.length() < 50; // Simple check for inside view
  
  // Highlight the constellation immediately
  console.log(`Highlighting constellation: ${constellationAbbr}`);
  
  // Try manual highlighting first to test
  console.log(`Found ${constellationLines.length} lines to highlight`);
  constellationLines.forEach((line, index) => {
    console.log(`Line ${index}:`, line);
    console.log(`Line material:`, line.material);
    console.log(`Current color:`, line.material.color.getHexString());
    
    // Try creating a completely new material
    const newMaterial = new THREE.LineBasicMaterial({ 
      color: 0xff0000, // Bright red
      transparent: false,
      opacity: 1.0
    });
    line.material = newMaterial;
    line.material.needsUpdate = true;
    line.userData.isHighlighted = true; // Mark as highlighted
    
    console.log(`New material created with color:`, line.material.color.getHexString());
  });
  
  // Also try the function
  console.log(`Calling highlightConstellation function for ${constellationAbbr}`);
  constellations.highlightConstellation(constellationAbbr, 0xffcc00); // Bright yellow highlight
  
  // Temporarily hide sphere to test if it's interfering
  if (window.constellationSphere) {
    window.constellationSphere.visible = false;
  }
  
  // For outside view, make sphere opaque
  if (!isInsideView && window.constellationSphere) {
    window.constellationSphere.material.transparent = false;
    window.constellationSphere.material.opacity = 1.0;
    window.constellationSphere.visible = true; // Make sure it's visible
  }
  
  // Create smooth camera animation
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  
  // Calculate target camera position (offset from constellation center for good viewing)
  const offsetDistance = isInsideView ? 25 : 90; // Slightly farther for constellations
  const direction = center.clone().normalize();
  const targetPosition = center.clone().add(direction.multiplyScalar(offsetDistance));
  
  // Animation parameters
  const duration = 3000; // 3 seconds for constellation zoom
  const startTime = Date.now();
  
  function animateCamera() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Use easing function for smooth animation
    const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
    
    // Interpolate camera position
    camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
    
    // Interpolate camera target (look at the constellation center)
    controls.target.lerpVectors(startTarget, center, easeProgress);
    
    controls.update();
    
    if (progress < 1) {
      requestAnimationFrame(animateCamera);
    } else {
      console.log(`Successfully zoomed to constellation ${constellationAbbr}`);
      
      // After animation completes, reset effects after 3 MORE seconds
      setTimeout(() => {
        // Reset constellation highlight manually
        console.log(`Resetting highlight for constellation: ${constellationAbbr}`);
        constellationLines.forEach((line) => {
          line.material.color.setHex(0xffffff); // Reset to original white
          line.material.needsUpdate = true; // Force material update
          line.material.transparent = false; // Make sure it's not transparent
          line.material.opacity = 1.0; // Full opacity
          line.userData.isHighlighted = false; // Remove highlight flag
        });
        
        // Also try the function
        constellations.resetHighlight();
        
        // Reset sphere transparency (outside view only)
        if (!isInsideView && window.constellationSphere) {
          window.constellationSphere.material.transparent = true;
          window.constellationSphere.material.opacity = 0.05;
          window.constellationSphere.visible = true;
        }
        
        // Re-show sphere for inside view
        if (isInsideView && window.constellationSphere) {
          window.constellationSphere.visible = true;
        }
        
        console.log(`Reset highlighting and sphere transparency for ${constellationAbbr}`);
      }, 3000); // This is 3 seconds AFTER the zoom animation completes
    }
  }
  
  animateCamera();
};

// Animate and highlight
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(constellations.children, true);

  // Reset all to white (but preserve highlighted lines)
  constellations.children.forEach((line) => {
    if (line.material && !line.userData.isHighlighted) {
      line.material.color.set(0xffffff);
    }
  });

  // Highlight intersected one and log it
  if (intersects.length > 0) {
  const hit = intersects[0].object;
  const constellationName = hit.userData.constellation;

  constellations.children.forEach((line) => {
    if (line.userData.constellation === constellationName) {
      line.material.color.set(0xffa500); // highlight
    }
  });

  console.log("HIT CONSTELLATION:", constellationName);
}
  }
animate();
