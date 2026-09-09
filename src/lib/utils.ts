import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBDT(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace("BDT", "৳");
}

export function formatBatWeight(oz: number): { imperial: string; metric: string } {
  const lbs = Math.floor(oz / 16);
  const remOz = (oz % 16).toFixed(1);
  const grams = Math.round(oz * 28.3495);
  return {
    imperial: `${lbs}lb ${remOz}oz`,
    metric: `${grams}g`,
  };
}
