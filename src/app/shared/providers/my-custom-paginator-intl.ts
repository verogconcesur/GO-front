import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Injectable()
export class MyCustomPaginatorIntl implements MatPaginatorIntl {
  public changes = new Subject<void>();
  // You can set labels to an arbitrary string too, or dynamically compute
  // it through other third-party internationalization libraries.
  public nextPageLabel = this.translate.instant(marker('pagination.nextPage'));
  public previousPageLabel = this.translate.instant(marker('pagination.prevPage'));
  public itemsPerPageLabel = this.translate.instant(marker('pagination.itemsPerPage'));
  public firstPageLabel = this.translate.instant(marker('pagination.firstPage'));
  public lastPageLabel = this.translate.instant(marker('pagination.lastPage'));

  constructor(private translate: TranslateService) {
    // this.nextPageLabel = this.translate.instant(this.nextPageLabel);
    // this.previousPageLabel = this.translate.instant(this.previousPageLabel);
    // this.itemsPerPageLabel = this.translate.instant(this.itemsPerPageLabel);
    // this.firstPageLabel = this.translate.instant(this.firstPageLabel);
    // this.lastPageLabel = this.translate.instant(this.lastPageLabel);
  }

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return this.translate.instant(marker('pagination.pageOf'), { num1: 1, num2: 1 });
    }
    const amountPages = Math.ceil(length / pageSize);
    return this.translate.instant(marker('pagination.pageOf'), { num1: page + 1, num2: amountPages });
  }
}
