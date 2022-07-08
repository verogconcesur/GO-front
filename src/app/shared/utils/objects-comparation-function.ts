/* eslint-disable @typescript-eslint/no-explicit-any */
export const areObjectsEqualsWithDeepComparation = (object1: any, object2: any): boolean => {
  if (!object1 && !object2) {
    return true;
  }
  if (!object1 || !object2) {
    return false;
  }
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = val1 && val2 && typeof val1 === 'object' && typeof val2 === 'object';
    const areArrays = val1 && val2 && Array.isArray(val1) && Array.isArray(val2);
    if (areArrays && val1.length !== val2.length) {
      return false;
    } else if (areArrays) {
      let arrayComparationResult = true;
      val1.forEach((value1) => {
        if (
          val2.findIndex((value2) => {
            if (typeof value1 !== typeof value2) {
              return false;
            } else if (
              (Array.isArray(value1) && Array.isArray(value2)) ||
              (typeof value1 === 'object' && typeof value2 === 'object')
            ) {
              return areObjectsEqualsWithDeepComparation(value1, value2);
            } else {
              return value1 === value2;
            }
          }) === -1
        ) {
          arrayComparationResult = false;
        }
      });
      if (!arrayComparationResult) {
        return false;
      }
    } else if (areObjects && !areObjectsEqualsWithDeepComparation(val1, val2)) {
      return false;
    } else if (!areObjects && !areArrays && val1 !== val2) {
      return false;
    }
  }
  return true;
};
