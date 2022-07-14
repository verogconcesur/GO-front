import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { throwError } from 'rxjs';

export const validateDateFormat = (
  date: string,
  translateService: TranslateService,
  format?: string,
  separator?: string
): string => {
  format = format ? format : 'DD/MM/YYYY';
  separator = separator ? separator : '/';
  if (date.length !== 10) {
    return translateService.instant(marker('errors.dateFormat'), { format });
  } else {
    const da = date.split(separator);
    const daFormat = format.split(separator);
    const dayArrayLocation = daFormat.indexOf('DD');
    const monthArrayLocation = daFormat.indexOf('MM');
    const yearArrayLocation = daFormat.indexOf('YYYY');
    if (
      da.length !== 3 ||
      da[yearArrayLocation].length !== 4 ||
      da[monthArrayLocation].length !== 2 ||
      da[dayArrayLocation].length !== 2
    ) {
      return translateService.instant(marker('errors.dateFormat'), { format });
    } else {
      try {
        const newDate = new Date(
          parseInt(da[yearArrayLocation], 10),
          parseInt(da[monthArrayLocation], 10) - 1,
          parseInt(da[dayArrayLocation], 10)
        );
        if (
          newDate.getFullYear() !== parseInt(da[yearArrayLocation], 10) ||
          newDate.getDate() !== parseInt(da[dayArrayLocation], 10) ||
          newDate.getMonth() !== parseInt(da[monthArrayLocation], 10) - 1
        ) {
          throwError('Format error');
        }
      } catch (error) {
        return translateService.instant(marker('errors.dateFormat'), { format });
      }
    }
  }
  return marker('errors.unknown');
};
