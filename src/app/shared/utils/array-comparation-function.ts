/* eslint-disable @typescript-eslint/no-explicit-any */
export const haveArraysSameValues = (array1: any[], array2: any[]): boolean =>
  array1 &&
  array2 &&
  array1.length === array2.length &&
  array1.every((value, index) => array2.findIndex((value2) => value && value2 && value === value2) >= 0);
