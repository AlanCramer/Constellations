//This is the loader for the stars. 
//It loads the stars from the CSV file.
//It returns a map of stars.
//Each star is { name: "Sirius", hr: 1, ra: 6.75, dec: -16.71, mag: -1.46 }.
//It is used to create the star field.
 


import Papa from "papaparse";
import { raDecToVec3 } from "../utils/utils";

export async function loadStarMap(url = "../../public/stars1000.csv") {
  const res = await fetch(url);
  const text = await res.text();

  const { data } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });

  //This creates an empty container/map/object to store stars. 
  const starMap = new Map();
  const radius = 100; //this adjusts the size of the star field/constellation lines (not the labels that's elsewhere)

  //loop through each row of the csv file, (ra, dec, mag, hr, name etc)
  for (const row of data) {
    const basePos = raDecToVec3(row.ra * 15, row.dec, radius); //CHLOE -- what is this basePos used for? 
    //builds a star object! 
    const star = {
      name: row.name?.trim(),
      hr: parseInt(row.hr, 10),
      ra: parseFloat(row.ra) * 15, // hours → degrees
      dec: parseFloat(row.dec),
      pos: basePos.clone().multiplyScalar(-1), // Keep original for compatibility
      posOutside: basePos.clone(), // Outside view position
      posInside: basePos.clone().multiplyScalar(-1), // Inside view position
      mag: parseFloat(row.mag),
    };

    //skip stars if they are missing data
    if (isNaN(star.ra) || isNaN(star.dec) || isNaN(star.mag)) continue;
    if (!star.hr) continue;

    // save the star into the map (key is the hr, value is the star object)
    // example: starMap.get(2491) → { name: "Sirius", ra: 101.28, dec: -16.72, mag: -1.46, … }
    starMap.set(star.hr, star);
  }

  return starMap; //this is a map of data that createStarField.js will use to build the star field. 
  // createStarField.js will consume starMap. 
}
