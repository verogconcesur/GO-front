/* eslint-disable @typescript-eslint/no-explicit-any */
export const haveArraysSameValues = (array1: any[], array2: any[]): boolean =>
  array1 && array2 && array1.length === array2.length && array1.every((value, index) => value === array2[index]);
