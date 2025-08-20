import Papa from "papaparse";

// only exported for testing
export function createConstellationMap(csvfile: string) {
  const { data, meta } = Papa.parse(csvfile, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  });

  // maxStarCount is the number of stars in the biggest constellation
  const maxStarCount = Math.max(0, meta.fields.length - 2); // "abr" + "nr" are the first 2
  const constellationMap = new Map();

  for (const row of data) {
    const abr = row.abr?.trim();
    if (!abr) continue;

    const ids: number[] = [];
    for (let i = 1; i <= maxStarCount; i++) {
      const val = row[`s${String(i).padStart(2, "0")}`]?.trim();
      if (val && !isNaN(+val)) ids.push(+val);
    }

    constellationMap.set(abr, ids);
  }

  return constellationMap;
}

// create a Map of constellation abreviation (see data file)
// to a list of stars (HR ids)
export async function readConstellationCSV(
  url = "../../public/ConstellationLines.csv"
) {
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);

  const text = await res.text();

  return createConstellationMap(text);
}
