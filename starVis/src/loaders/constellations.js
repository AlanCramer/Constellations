import Papa from "papaparse";

/**
 * Load IAU “symbol” line sequences from CSV and return a flat array of edges.
 * Each edge is { name: "ORI", star1: 190, star2: 225 }.
 *
 * @param {string} url
 * @returns {Promise<Array<{name:string,star1:number,star2:number}>>}
 */
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

  const edges = [];

  for (const row of data) {
    const abr = row.abr?.trim();
    if (!abr) continue;

    const ids = [];
    for (let i = 1; i <= 31; i++) {
      const val = row[`s${String(i).padStart(2, "0")}`]?.trim();
      if (val && !isNaN(+val)) ids.push(+val);
    }

    for (let i = 0; i < ids.length - 1; i++) {
      edges.push({ name: abr, star1: ids[i], star2: ids[i + 1] });
    }
  }

  if (edges.length === 0) {
    console.warn("loadConstellationEdges: parsed zero edges — wrong CSV?");
  }
  return edges;
}
