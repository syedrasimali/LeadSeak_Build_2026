import { FlaskConical } from "lucide-react";

/* Persistent, honest marker that the dashboard is showing fabricated data.
   Remove alongside lib/demo-data.ts when the data layer lands. */
function DemoDataNotice() {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-indigo-blue-500/24 bg-indigo-blue-500/[0.07] px-4 py-3">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border border-indigo-blue-500/28 bg-indigo-blue-500/12 text-indigo-blue-300">
        <FlaskConical className="size-3.5" />
      </span>
      <p className="text-caption text-content-secondary">
        <span className="font-medium text-content">Demo data.</span> Every
        figure on this dashboard is fabricated for UI review — nothing is
        fetched or saved. Interactions like search, filtering, and the detail
        panel work against this in-memory sample.
      </p>
    </div>
  );
}

export { DemoDataNotice };
