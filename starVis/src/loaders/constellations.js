import Papa from "papaparse";

// create a Map of constellation abreviation (see data file)
// to a list of stars (HR ids)
export async function loadConstellationEdges(
  url = "../../public/ConstellationLines.csv"
) {
  const res = await fetch(url);
  const text = await res.text();

  const { data } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const constellationMap = new Map();

  for (const row of data) {
    const abr = row.abr?.trim();
    if (!abr) continue;

    const ids = [];
    for (let i = 1; i <= 31; i++) {
      const val = row[`s${String(i).padStart(2, "0")}`]?.trim();
      if (val && !isNaN(+val)) ids.push(+val);
    }

    constellationMap.set(abr, ids);
  }

  return constellationMap;
}
