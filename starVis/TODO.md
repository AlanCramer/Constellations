1. checkboxes for

   - toggle star names
   - toggle constellation names
   - toggle HR names (?)

2. Hightlight constellation on mouse over

3. On zoom, update slider value

4. Add asterisms with toggle

5. Refactor using more resuable files:

I'm thinking something like

```plaintext
src/
├── main.js                  ← bootstraps app: scene, camera, renderers, animation loop
├── camera.js                ← camera setup (orthographic or perspective)
├── controls.js              ← orbit controls setup
├── renderers.js             ← WebGL and label renderers
│
├── loaders/                 ← loads raw data into JS objects (data model only)
│   ├── stars.js             ← loads star list with { ra, dec, mag, name, hr }
│   ├── constellations.js    ← loads constellation edges as star HR pairs
│
├── view/                    ← converts data to THREE.js objects (view layer)
│   ├── StarField.js         ← Points mesh from star data
│   ├── StarLabels.js        ← CSS2DObject array from star data
│   ├── ConstellationLines.js← Line objects from edge list
│   ├── ConstellationLabels.js← CSS2DObject from grouped constellation lines
│   ├── Ecliptic.js          ← dashed circle line
│   ├── CelestialEquator.js  ← yellow equator line
│
├── dom/                      ← user controls (DOM elements, checkboxes, sliders)
│   ├── visibilityControls.js← create checkboxes, attach listeners
│   ├── fovSlider.js         ← field of view control
│
├── utils/
│   ├── raDecToVec3.js       ← coordinate transformation
│   ├── visibilityToggler.js ← register/set/get visibility for named groups
```

6. Add polygonal boundaries of the constellations - toggle

7. Render stars more akin to brightness level (color?)

8. Render the celestial equator - toggle

9. If mouse is near stars with overlapping labels, adjust the label positions

10. Render the lat/long lines - toggle

11. Figure out where on earth you would need to be to see the current sky

- expecting something like: at earth lat/long ("in australia") looking E-N-E
- how to display that? (globe?)
- what kind of telescope?

12. make stars5000, stars10000, stars20000

- does performance slow?
- does UI get too busy?

13. render constellation art - toggle

14. rotate the sky based on date, location, time frame

- what will the sky look like on Tuesday from Sandpoint ID?
- how will it move during the night?

15. Add satellite positions - toggle

16. world viewed updside down? Polaris is south?

17. I'm surprised by what the sphere looks like when zoomed out

- I think we see a hemisphere, but I would think it should be from the inside
- It looks like from the outside
- am I thinking wrong? seems okay if we're zoomed in a bit

18. Flashcard mode

19. List the constellation names on the side, click and animate the view to show it

20. filter_hyg_stars.py throws some errors - fix that

21. ensure every star referenced by the ConstellationLines.csv is captured in stars<n>.csv

22. Allow the user to customize the number of stars shown
