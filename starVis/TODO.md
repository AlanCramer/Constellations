| Status | Task       |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DONE   | Checkboxes for:<br>- toggle star names<br>- toggle constellation names<br>- toggle HR names  |
|        | Highlight constellation on mouse  |
|        | On zoom, update slider value         |
|        | Add asterisms with toggle         |
| DONE   | REFACTOR |
|        | Add polygonal boundaries of the constellations – toggle   |
|        | Render stars more akin to brightness level (color?)    |
|        | Render the celestial equator – toggle       |
|        | If mouse is near stars with overlapping labels, adjust the label positions      |
|        | Render the lat/long lines – toggle     |
|        | Figure out where on Earth you would need to be to see the current sky:<br>- expecting something like: at Earth lat/long ("in Australia") looking E‑N‑E<br>- how to display that? (globe?)<br>- what kind of telescope?     |
|        | Make stars5000, stars10000, stars20000:<br>- does performance slow?<br>- does UI get too busy?     |
|        | Render constellation art – toggle      |
|        | Rotate the sky based on date, location, time frame:<br>- what will the sky look like on Tuesday from Sandpoint ID?<br>- how will it move during the night?     |
|        | Add satellite positions – toggle    |
|        | World viewed upside‑down? Polaris is south?<br>- surprised by what the sphere looks like when zoomed out<br>- I think we see a hemisphere, but I would think it should be from the inside<br>- It looks like from the outside<br>- Am I thinking wrong? seems okay if we're zoomed in a bit |
|        | Flashcard mode   |
|        | List the constellation names on the side, click and animate the view to show it  |
|        | `filter_hyg_stars.py` throws some errors – fix that    |
|        | Ensure every star referenced by the `ConstellationLines.csv` is captured in `stars<n>.csv`  |
|        | Allow the user to customize the number of stars shown     |
