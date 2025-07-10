## Getting Started with Threejs via Constellations

0. ### "Basics"

   - Terminal
   - IDE (I use VSCode)
   - Github account
   - python (I use python3, i.e., "python" runs "python3")

   Do you use the command line?

   - ls, cd, mkdir, cat, touch, head, tail, grep, vi, ssh  
     What OS do you use?

1. ### Install Node

   Install Node Version Manager (a curl command)

   - nvm install

2. ### Client / Server or How Does the Internet work?

   What happens when you type a url in your browser?  
   What's a webservice?  
   What's a client?  
   python -m http.server

3. ### HTML

   ```html
   <head></head>
   <body>
     <button>Button</button>
     <svg width="300" height="200" style="border: 2px solid black">
       <rect x="10" y="10" width="20" height="10" fill="red" />
       <circle r="10" cx="50" cy="10" fill="blue" />
     </svg>
   </body>
   ```

4. ### Use node a bit

   testNode.js:

   ```js
   console.log("hello from node!");
   ```

   Run it with:

   ```bash
   node testNode.js
   ```

   testNode2.js

   ```js
   let x0 = 1;
   let x1 = 1;
   let x = 0;

   console.log("Fibonacci numbers");
   process.stdout.write(`${x0} ${x1} `);

   while (x < 100) {
     x = x0 + x1;
     process.stdout.write(`${x} `);
     x0 = x1;
     x1 = x;
   }

   console.log("");
   ```

   Note that these examples are running "server-side" with the node engine

5. ### Use vite to Start a Server

   `npm install vite`

   Node Package Manager (think pip for node) downloads libraries into node_modules directory. But it can also install applications or scripts into node_modules. Those can be run using "npx"

   `npx vite`

   Other commands that might be useful:

   ```
   npx vite build
   npx vite --help
   npx eslint .
   npx stylelint "**/*.css"
   npx vitest
   npx tsc -noEmit
   ```

   Try serving a directory with a new html file. Notice auto refresh behavior. Import
   a js file.

6. ### Install Threejs

   `npm install three`  
   `npm install three-stdlib`

   What is threejs? It's a javascript library for managing 3D graphics. It
   leverages webgl, a javascript graphics library that, in turn, leverages the GPU.  
   It allows the programmer to think in terms of a scene with lights that
   contains 3D objects that have materials (color, shininess, textures).

   What is three-stdlib? Some examples in the threejs world are so handy and reusable,
   they have become part of the extended threejs world. Pan, Rotate, Zoom controls like
   Orbit, Trackball, FirstPerson, and Fly are found there. Also some Loader utilities
   like STL, GLT, Font etc.

   Test questions:

   - What is a GPU?
   - Does your computer have one?
   - Does your phone have one?

7. ### From the Top - a basic Threejs project "from scratch"

   ```bash
   mkdir test1
   cd test1
   npm init -y

   npm install vite three three-stdlib

   mkdir public src
   touch index.html src/main.js
   ```

   index.html:

   ```html
   <!DOCTYPE html>
   <html lang="en">
     <head>
       <meta charset="UTF-8" />
       <title>Three.js with Vite</title>
     </head>
     <body>
       <canvas id="app"></canvas>
       <script type="module" src="/src/main.js"></script>
     </body>
   </html>
   ```

   src/main.js

   ```js
   import * as THREE from "three";

   const scene = new THREE.Scene();

   // Camera
   const camera = new THREE.PerspectiveCamera(
     75,
     window.innerWidth / window.innerHeight,
     0.1,
     1000
   );
   camera.position.z = 2;

   // Renderer
   const renderer = new THREE.WebGLRenderer({
     canvas: document.getElementById("app"),
   });
   renderer.setSize(window.innerWidth, window.innerHeight);

   // Geometry & Material
   const geometry = new THREE.BoxGeometry();
   const material = new THREE.MeshStandardMaterial({
     color: 0x0000ff,
     metalness: 0.5,
     roughness: 0.5,
   });
   const cube = new THREE.Mesh(geometry, material);
   scene.add(cube);

   // Light (you must have at least one!)
   const light = new THREE.DirectionalLight(0xffffff, 1);
   light.position.set(5, 5, 5); // position matters!
   scene.add(light);

   renderer.render(scene, camera);
   ```

   ```bash
   npx vite
   ```

   Few things to notice:

   - We're not full screen, we're in a canvas on the html page.
   - The x-y-z coordinate system has the x-axis going from left to right, y-axis up, z coming out
   - Think about the relative position of the camera, light and the geometry.
   - Move the camera, move the box and move the light

8. ### Let's add animation

   At the bottom of main.js

   ```js
   function animate() {
     requestAnimationFrame(animate);
     cube.rotation.y += 0.01;
     cube.rotation.x += 0.01;
     renderer.render(scene, camera);
   }
   animate();
   ```

9. ### And User Controls

   We need to do 3 things to get OrbitControls working: import it, instantiate it, update it
   in the animate loop.

   Import it:

   ```js
   import { OrbitControls } from "three-stdlib";
   ```

   Instantiate it:

   ```js
   const controls = new OrbitControls(camera, renderer.domElement);
   ```

   Update in animate():

   ```js
   function animate() {
     requestAnimationFrame(animate);
     //cube.rotation.y += 0.01;
     //cube.rotation.x += 0.01;
     controls.update();
     renderer.render(scene, camera);
   }
   ```

10. ### Try it

- Can you add a second Box near the first one and make it a different color?
- Can you add a white ball where the camera is?
