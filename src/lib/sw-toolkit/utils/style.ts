// import { clsx, type ClassValue } from "clsx";
// import { twMerge } from "tailwind-merge";

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

export function getCssVar(ref: Element, name: string) {
  const computedStyle = getComputedStyle(ref);
  const cssVarValue = computedStyle.getPropertyValue(name);
  return parseFloat(cssVarValue) || null;
}
