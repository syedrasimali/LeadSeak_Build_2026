import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/* The design system defines custom font-size tokens (text-display, text-h1,
   text-body, text-caption, …). tailwind-merge only knows Tailwind's stock
   scale, so it misreads these as text-COLOR utilities and drops a genuine
   color class that sits alongside them — e.g. `text-caption text-electric-300`
   would lose the color. Registering them under font-size keeps size and color
   in separate conflict groups. */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "h1",
            "h2",
            "h3",
            "body-lg",
            "body",
            "small",
            "caption",
            "label",
            "overline",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
