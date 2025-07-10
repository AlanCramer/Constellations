import Papa from "papaparse";
import { raDecToVec3 } from "../utils/utils";

export async function loadStarMap(url = "../../public/stars2000.csv") {
  const res = await fetch(url);
  const text = await res.text();

  const { data } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });

  const starMap = new Map();
  const radius = 100;

  for (const row of data) {
    const star = {
      name: row.name?.trim(),
      hr: parseInt(row.hr, 10),
      ra: parseFloat(row.ra) * 15, // hours → degrees
      dec: parseFloat(row.dec),
      pos: raDecToVec3(row.ra * 15, row.dec, radius).multiplyScalar(-1),
      mag: parseFloat(row.mag),
    };

    if (isNaN(star.ra) || isNaN(star.dec) || isNaN(star.mag)) continue;
    if (!star.hr) continue;

    starMap.set(star.hr, star);
  }

  return starMap;
}
