//This function remove accents and return the string in lowerCase
export const normalizaStringToLowerCase = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
