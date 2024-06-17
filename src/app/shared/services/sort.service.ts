import { Injectable } from '@angular/core';

@Injectable()
export class SortService {
  constructor() {}

  public alphaNumericSort = (a: string, b: string) => {
    //Primero ordenar por titulo alfanumericamente (ascendente)
    const stringSort = this.stringSort(
      this.transformAlphaNumericStringToSortableString(a),
      this.transformAlphaNumericStringToSortableString(b)
    );
    if (stringSort === 1) {
      return 1;
    } else if (stringSort === -1) {
      return -1;
    }
  };

  /**
   * Ordenar el string mirando primero si tiene un valor numérico y luego alfabéticamente
   *
   * @param a
   * @param b
   * @returns number
   */
  public stringSort(a: string, b: string): number {
    const valorNumericoA = this.getStringIndexNumber(a);
    const valorNumericoB = this.getStringIndexNumber(b);

    if (!isNaN(valorNumericoA) && !isNaN(valorNumericoB)) {
      if (valorNumericoA < valorNumericoB) {
        return -1;
      } else if (valorNumericoA > valorNumericoB) {
        return 1;
      } else {
        return a.localeCompare(b);
      }
    } else if (!isNaN(valorNumericoA)) {
      return -1;
    } else if (!isNaN(valorNumericoB)) {
      return 1;
    } else {
      return a.localeCompare(b);
    }
  }

  /**
   * Función que recibe un string que puede contener una máscara del tipo «XXX.XXX.XXX Título».
   * Podrá haber n números separados entre ellos por puntos (hasta un máxio de tres número entre cada punto)
   *
   * @param str
   * @returns string to use in sort function
   */
  public transformAlphaNumericStringToSortableString(str: string): string {
    // Expresión regular para encontrar números separados por puntos y un título opcional
    const regex = /^(\d+)\.?(\d+)?\.?(\d+)?(\s?.+)?$/;

    // Utilizamos match() para buscar números y el título en el input
    const match = str ? str.match(regex) : false;

    if (match) {
      // Capturamos los números y el título
      const num1 = match[1] || '';
      const num2 = match[2] || '';
      const num3 = match[3] || '';
      const titulo = match[4] || '';

      // Concatenamos los números con ceros entre ellos si es necesario
      const numeroFinal = num1.padStart(1, '0') + num2.padStart(3, '0') + num3.padStart(3, '0');

      // Concatenamos el número final con el título
      const resultado = numeroFinal + ' ' + titulo;
      return resultado;
    } else {
      // Si no se encuentra ningún número en el formato, devolvemos el input original
      return str;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getStringIndexNumber(str: string): number | any {
    const match = str.match(/^(\d+)/);
    return match ? parseInt(match[0], 10) : NaN;
  }
}
