import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import MentionDataListDTO from '@data/models/notifications/mention-data-list-dto';
import MentionFilterDTO from '@data/models/notifications/mention-filter-dto';
import { NotificationService } from '@data/services/notifications.service';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-mentions',
  templateUrl: './mentions.component.html',
  styleUrls: ['./mentions.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MentionsComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public labels: any = {
    newMentions: marker('common.unread'),
    oldMentions: marker('common.readen'),
    noDataToShow: marker('errors.noDataToShow')
  };
  public mentions: MentionDataListDTO[] = [];
  public loading = false;
  public filterValue: MentionFilterDTO = null;
  public paginationConfig = {
    length: 10,
    pageSize: 10,
    page: 0,
    totalPages: 0,
    first: true,
    last: false
  };
  private originalMentions: MentionDataListDTO[] = [];

  constructor(
    private mentionService: NotificationService,
    private datePipe: DatePipe,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.filterValue = {
      readFilterType: 'NO_READ'
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onScroll(event: any): void {
    //Accedemos a las propiedades del html
    const scrollContainer = event.target as HTMLElement;
    // Dejamos un umbral de 100 antes de llegar al final del contenedor
    const threshold = 100;
    // Se calcula la posicion actual del scroll
    const position = scrollContainer.scrollTop + scrollContainer.clientHeight;
    // Obtenemos la altura total del contenido dentro del contenedor desplazable
    const height = scrollContainer.scrollHeight;

    // Si la posición actual del scroll está dentro del umbral de 100 píxeles del final
    // del contenedor, y no estamos en la última página de resultados ni ya buscando
    // entonces incrementamos la página actual y solicitamos más datos.
    if (position > height - threshold && !this.paginationConfig.last && !this.loading) {
      this.paginationConfig.page += 1;
      this.getData();
    }
  }

  public markAsViewed(item: MentionDataListDTO): void {
    this.loading = true;
    this.mentionService
      .markMentionAsRead(item.cardInstanceCommentId)
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((data) => {
        this.getData();
      });
  }

  public getItemComment(item: MentionDataListDTO): string {
    return `${this.datePipe.transform(new Date(item.dateComment), 'dd-MM-yyyy, HH:mm')}: ${item.comment}`;
  }

  public filterDataToShow(): void {
    this.mentions = [...this.originalMentions];
  }

  public getData() {
    this.loading = true;
    this.mentionService
      .searchMentions(this.filterValue, this.paginationConfig)
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((data: PaginationResponseI<MentionDataListDTO>) => {
        if (data) {
          this.paginationConfig.length = data.totalElements;
          this.paginationConfig.first = data.first;
          this.paginationConfig.last = data.last;
          this.paginationConfig.page = data.number;
          this.paginationConfig.totalPages = data.totalPages;
          this.paginationConfig.first = data.first;
          if (data.first) {
            this.mentions = [];
          }
          this.mentions = [...this.mentions, ...data.content];
        } else {
          this.mentions = [];
        }
      });
  }
}
