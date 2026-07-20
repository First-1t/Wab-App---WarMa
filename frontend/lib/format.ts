export const fmt = (n: number) =>
  n.toLocaleString("th-TH", { maximumFractionDigits: 0 });

export const levelColors: Record<
  string,
  { bg: string; border: string; badge: string; bar: string }
> = {
  เพียงพอ: {
    bg: "bg-green-50",
    border: "border-green-600",
    badge: "bg-green-600",
    bar: "bg-green-600",
  },
  จำกัด: {
    bg: "bg-amber-50",
    border: "border-amber-600",
    badge: "bg-amber-600",
    bar: "bg-amber-600",
  },
  ขาดแคลน: {
    bg: "bg-red-50",
    border: "border-red-600",
    badge: "bg-red-600",
    bar: "bg-red-600",
  },
};

export const colorsFor = (level: string) =>
  levelColors[level] ?? levelColors["จำกัด"];
