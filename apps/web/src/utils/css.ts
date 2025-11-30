const root = document.documentElement;

/**
 * Get the value of a CSS variable
 * @param varName - The name of the CSS variable
 * @returns The value of the CSS variable
 */
export const getCSSVar = (varName: string) => {
  return getComputedStyle(root).getPropertyValue(varName).trim();
};
