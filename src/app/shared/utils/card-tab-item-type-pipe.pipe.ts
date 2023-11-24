import { Pipe, PipeTransform } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'cardTabItemTypePipe'
})
export class CardTabItemTypePipePipe implements PipeTransform {
  public labels = {
    TITLE: marker('common.customTabItem.TITLE'),
    TEXT: marker('common.customTabItem.TEXT'),
    INPUT: marker('common.customTabItem.INPUT'),
    LIST: marker('common.customTabItem.LIST'),
    TABLE: marker('common.customTabItem.TABLE'),
    OPTION: marker('common.customTabItem.OPTION')
  };
  constructor(private translateService: TranslateService) {}

  transform(value: string, ...args: unknown[]): string {
    return this.translateService.instant('common.customTabItem.' + value);
  }
}
