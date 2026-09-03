import {
  ClipboardCheck,
  ClipboardPaste,
  Copy,
  FolderTree,
  RotateCcw,
  Search,
} from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const steps = [
  { label: "Search", icon: Search, note: "Open six tabs" },
  { label: "Copy", icon: Copy, note: "Grab a name" },
  { label: "Paste", icon: ClipboardPaste, note: "Into a sheet" },
  { label: "Verify", icon: ClipboardCheck, note: "Is it current?" },
  { label: "Organize", icon: FolderTree, note: "Tag and sort" },
  { label: "Repeat", icon: RotateCcw, note: "All week" },
];

function ProblemSection() {
  return (
    <section className="relative border-y border-line bg-canvas-subtle">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-overline uppercase text-content-muted">
            The problem
          </p>
          <h2 className="mt-3 text-h2 text-content">
            Manual prospect research is slow.
          </h2>
          <p className="mt-4 text-body text-content-secondary">
            Finding one qualified prospect means bouncing between a search
            engine, three directories, and a spreadsheet. Then doing it again.
            The work is not hard — it is just endless.
          </p>
        </Reveal>

        {/* The loop, drawn as a chain that returns to its start. */}
        <div className="mt-14">
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isLast = i === steps.length - 1;

              return (
                <li key={step.label} className="relative">
                  <Reveal delay={i * 100}>
                    <div
                      className={`h-full rounded-xl border bg-surface p-4 transition-colors duration-300 ${
                        isLast
                          ? "border-dashed border-warning/32"
                          : "border-line hover:border-line-strong"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`grid size-8 place-items-center rounded-lg border ${
                            isLast
                              ? "border-warning/28 bg-warning/12 text-warning-soft"
                              : "border-line bg-canvas-subtle text-content-muted"
                          }`}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="font-mono text-[0.625rem] text-content-disabled">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="mt-3 text-small font-medium text-content">
                        {step.label}
                      </p>
                      <p className="mt-0.5 text-caption text-content-muted">
                        {step.note}
                      </p>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>

          <Reveal delay={200}>
            <div className="mt-6 flex items-center gap-3">
              <span
                aria-hidden
                className="h-px flex-1 bg-gradient-to-r from-transparent via-warning/24 to-warning/32"
              />
              <span className="inline-flex items-center gap-2 rounded-full border border-warning/28 bg-warning/10 px-3 py-1.5 text-caption font-medium text-warning-soft">
                <RotateCcw className="size-3" />
                Six steps, every single prospect
              </span>
              <span
                aria-hidden
                className="h-px flex-1 bg-gradient-to-l from-transparent via-warning/24 to-warning/32"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export { ProblemSection };
