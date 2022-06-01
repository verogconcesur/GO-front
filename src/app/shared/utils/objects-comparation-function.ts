/* eslint-disable @typescript-eslint/no-explicit-any */
export const areObjectsEqualsWithDeepComparation = (object1: any, object2: any): boolean =>
  //TODO: DGDC mejorar este método para comparar (teniendo en cuenta arrays)
  JSON.stringify(object1) === JSON.stringify(object2);
//   if (!object1 && !object2) {
//     return true;
//   }
//   if (!object1 || !object2) {
//     return false;
//   }
//   const keys1 = Object.keys(object1);
//   const keys2 = Object.keys(object2);
//   if (keys1.length !== keys2.length) {
//     return false;
//   }
//   for (const key of keys1) {
//     const val1 = object1[key];
//     const val2 = object2[key];
//     const areObjects = val1 && val2 && typeof val1 === 'object' && typeof val2 === 'object';
//     if ((areObjects && !areObjectsEqualsWithDeepComparation(val1, val2)) || (!areObjects && val1 !== val2)) {
//       return false;
//     }
//   }
