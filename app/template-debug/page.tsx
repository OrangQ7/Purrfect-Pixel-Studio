"use client";

import { useState } from "react";

import { type TemplateCell, mapMatrixToCells } from "@/lib/catTemplate";

const cells = mapMatrixToCells();

const regionClassNames: Record<string, string> = {
  BG: "bg-stone-100 text-stone-500",
  OL: "bg-stone-950 text-white",
  LE: "bg-rose-100 text-rose-950",
  RE: "bg-rose-100 text-rose-950",
  FH: "bg-amber-100 text-amber-950",
  LOF: "bg-orange-100 text-orange-950",
  LIF: "bg-amber-200 text-amber-950",
  FC: "bg-yellow-50 text-yellow-950",
  RIF: "bg-amber-200 text-amber-950",
  ROF: "bg-orange-100 text-orange-950",
  NU: "bg-lime-100 text-lime-950",
  CH: "bg-emerald-100 text-emerald-950",
  BU: "bg-teal-100 text-teal-950",
  BM: "bg-cyan-100 text-cyan-950",
  BE: "bg-sky-100 text-sky-950",
  BD: "bg-blue-100 text-blue-950",
  LL: "bg-indigo-100 text-indigo-950",
  RL: "bg-indigo-100 text-indigo-950",
  LP: "bg-violet-100 text-violet-950",
  RP: "bg-violet-100 text-violet-950",
  TB: "bg-fuchsia-100 text-fuchsia-950",
  TM: "bg-pink-100 text-pink-950",
  TT: "bg-red-100 text-red-950",
};

export default function TemplateDebugPage() {
  const [selectedCell, setSelectedCell] = useState<TemplateCell | null>(null);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 lg:px-10">
      <header>
        <h1 className="text-3xl font-bold tracking-normal text-stone-950">
          Pixel Cat Template Debug
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Fixed 21-column x 18-row semantic region map. Click any cell to
          inspect its row, column, and region.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[auto_280px]">
        <div
          className="grid w-fit overflow-hidden rounded-md border border-stone-300 bg-white shadow-sm"
          style={{ gridTemplateColumns: "repeat(21, minmax(0, 42px))" }}
        >
          {cells.map((cell) => (
            <button
              key={`${cell.row}-${cell.col}`}
              type="button"
              onClick={() => setSelectedCell(cell)}
              className={`flex h-10 w-10 items-center justify-center border border-stone-200 text-[11px] font-semibold ${
                regionClassNames[cell.region] ?? "bg-white text-stone-900"
              } ${
                selectedCell?.row === cell.row && selectedCell.col === cell.col
                  ? "ring-2 ring-stone-950 ring-offset-1"
                  : ""
              }`}
              title={`row ${cell.row}, col ${cell.col}, ${cell.region}`}
            >
              {cell.region}
            </button>
          ))}
        </div>

        <aside className="h-fit rounded-md border border-stone-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-950">
            Selected cell
          </h2>
          {selectedCell ? (
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-600">Row</dt>
                <dd className="font-semibold text-stone-950">
                  {selectedCell.row}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-600">Col</dt>
                <dd className="font-semibold text-stone-950">
                  {selectedCell.col}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-600">Region</dt>
                <dd className="font-semibold text-stone-950">
                  {selectedCell.region}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm leading-6 text-stone-600">
              No cell selected yet.
            </p>
          )}
        </aside>
      </section>
    </main>
  );
}
