//This is the loader for the constellation edges. 
//It loads the constellation edges from the CSV file.
//It returns a flat array of edges.
//Each edge is { name: "ORI", star1: 190, star2: 225 }.
//It is used to create the constellation lines.

import Papa from "papaparse";

/**
 * Create constellation map from CSV text
 * @param {string} csvText - The CSV file content as text
 * @returns {Map} Map where key is constellation abbreviation, value is array of star IDs
 */

//input raw csv text, returns a map of constellation abbreviations to star IDs!

export function createConstellationMap(csvText) {
  //parses the csv file. 
  const { data, meta } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  // maxStarCount is the number of stars in the biggest constellation
  // "abr" + "nr" are the first 2 columns, so we subtract 2 from total fields
  const maxStarCount = Math.max(0, meta.fields.length - 2);
  const constellationMap = new Map();

  //loops through each row of the csv file. 
  for (const row of data) {
    const abr = row.abr?.trim();
    if (!abr) continue;

    //creates an empty array to store the ids. 
    const ids = [];
    //loops through each column of the csv file. 
    for (let i = 1; i <= maxStarCount; i++) {
      const val = row[`s${String(i).padStart(2, "0")}`]?.trim();
      if (val && !isNaN(+val)) ids.push(+val);
    }

    // Store constellation data in MAP!
    constellationMap.set(abr, ids);
  }
  //Console log: 
  console.log("constellationMap in createConstellationMap:")
  let count = 0
  for (const [abr, ids] of constellationMap) {
    if (count >= 1) break; 
    console.log(`${abr}: [${ids.join(',')}]`)
    count++;
  }

  return constellationMap; // <---- RETURNING A MAP! --this parsing logic is used in loadConstellationData. 
  //Example: Leo: [3937,3969,3975,3873,3905,3731,3773,3873,3905,4031,4057,4357]
}


//Now... this uses the constellation map to create the constellation edges. 4
//////Should we rename this to be loadConstellationEdges? -- it creates the constellation edges array...? 


export async function loadConstellationEdges(
  url = "../../public/ConstellationLines.csv" //now we actually pass in the url, the data!
) {
  //fetches the csv file. 
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  
  //converts the csv file to text. (because createConstellationMap expects a string (csv text))
  const text = await res.text();
  const constellationMap = createConstellationMap(text);
  const edges = [];

  //loops through each constellation in the map --this creates the edges, the constellations lines!
  for (const [abr, ids] of constellationMap) {
    //creates edges by connecting each star to the next star in the sequence
    for (let i = 0; i < ids.length - 1; i++) {
      edges.push({ name: abr, star1: ids[i], star2: ids[i + 1] });
    }
  }

  if (edges.length === 0) {
    console.warn("loadConstellationEdges: parsed zero edges — wrong CSV?");
  }
  

  console.log("constellationMap in loadConstellationEdges")
  let count = 0
  for (const [abr, ids] of constellationMap) {
    if (count >= 1) break; 
    console.log(`${abr}: [${ids.join(',')}]`)
    count++;
  }

    //Debug: logging edges array (first 1 only)
    console.log("Edges (first 1 only):")
    console.log(edges.slice(0, 1))
    
    console.log(
      `Loaded ${constellationMap.size} constellations with ${edges.length} total edges`
    );
  

  return { edges };
}
