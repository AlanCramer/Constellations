// src/loaders/constellations.test.ts
import { describe, test, expect, afterEach, vi } from "vitest";
import { readConstellationCSV, createConstellationMap } from "./constellations";

// Helper: mock fetch to return a CSV string
const mockFetch = (csv: string) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    text: async () => csv,
  } as any);

afterEach(() => {
  vi.restoreAllMocks();
});

// --- Pure parser tests (no fetch needed) ---

test("counts headers-minus-2 and reads s1..sN (no padding)", () => {
  const csv = `abr,nr,s01,s02,s03
ORI,3,10,20,30`;
  const map = createConstellationMap(csv);
  console.log([...map.entries()]); // [["ORI", [10,20,30]]]
  expect(map.get("ORI")).toEqual([10, 20, 30]);
});

// --- readConstellationCSV tests (exercise fetch + parser) ---

test("parses abr and sXX numeric cells into a Map", async () => {
  const csv = `abr,nr,s01,s02,s03
ORI,1,123,456,789
UMA,2,1,2,3`;
  mockFetch(csv);

  const map = await readConstellationCSV("ignored");
  expect(map instanceof Map).toBe(true);
  expect(map.size).toBe(2);
  expect(map.get("ORI")).toEqual([123, 456, 789]);
  expect(map.get("UMA")).toEqual([1, 2, 3]);
});

test("trims headers/fields and skips empty lines", async () => {
  const csv = `  abr  ,  nr ,  s01 , s02
  ORI  ,  1 ,  42 ,   
  
  UMA,   2,  7,  8 `;
  mockFetch(csv);

  const map = await readConstellationCSV("ignored");
  expect(map.get("ORI")).toEqual([42]); // s02 empty → omitted
  expect(map.get("UMA")).toEqual([7, 8]);
});

test("skips rows without abr", async () => {
  const csv = `abr,nr,s01,s02
,1,1,2
   ,2,3,4
CMA,3,5,6`;
  mockFetch(csv);

  const map = await readConstellationCSV("ignored");
  expect(map.size).toBe(1);
  expect(map.get("CMA")).toEqual([5, 6]);
});

test("supports any number of sXX columns (s01..s40), ignores non-sXX", async () => {
  const headers = [
    "abr",
    "nr",
    ...Array.from(
      { length: 40 },
      (_, i) => `s${String(i + 1).padStart(2, "0")}`
    ),
    "misc",
  ];
  const values = [
    "TEST",
    "1",
    ...Array.from({ length: 40 }, (_, i) => String(i + 1)),
    "999",
  ];
  const csv = `${headers.join(",")}\n${values.join(",")}`;
  mockFetch(csv);

  const map = await readConstellationCSV("ignored");
  const ids = map.get("TEST")!;
  expect(ids.length).toBe(40);
  expect(ids[0]).toBe(1);
  expect(ids.at(-1)).toBe(40);
  expect(ids.includes(999)).toBe(false); // "misc" ignored
});

// important for repeated segments (e.g., constellation with repeated star ids)
test("keeps duplicate ids as-is (no dedupe)", async () => {
  const csv = `abr,nr,s01,s02,s03
DUP,1,10,10,20`;
  mockFetch(csv);

  const map = await readConstellationCSV("ignored");
  expect(map.get("DUP")).toEqual([10, 10, 20]); // current semantics
});

test("empty CSV yields empty Map", async () => {
  const csv = `abr,nr,s01,s02`;
  mockFetch(csv);

  const map = await readConstellationCSV("ignored");
  expect(map.size).toBe(0);
});
