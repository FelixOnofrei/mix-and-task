import type { Hue } from "./ritual-store";

export const hueDot: Record<Hue, string> = {
  amber: "bg-hue-amber",
  teal: "bg-hue-teal",
  violet: "bg-hue-violet",
  blue: "bg-hue-blue",
  rose: "bg-hue-rose",
  lime: "bg-hue-lime",
};

export const hueTint: Record<Hue, string> = {
  amber: "bg-hue-amber/15",
  teal: "bg-hue-teal/15",
  violet: "bg-hue-violet/15",
  blue: "bg-hue-blue/15",
  rose: "bg-hue-rose/15",
  lime: "bg-hue-lime/15",
};

export const hueRing: Record<Hue, string> = {
  amber: "ring-hue-amber",
  teal: "ring-hue-teal",
  violet: "ring-hue-violet",
  blue: "ring-hue-blue",
  rose: "ring-hue-rose",
  lime: "ring-hue-lime",
};
