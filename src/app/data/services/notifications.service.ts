import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import PaginationRequestI from '@data/interfaces/pagination-request';
import PaginationResponseI from '@data/interfaces/pagination-response';
import MentionDataListDTO from '@data/models/notifications/mention-data-list-dto';
import MentionFilterDTO from '@data/models/notifications/mention-filter-dto';
import NotificationDataListDTO from '@data/models/notifications/notification-data-list-dto';
import NotificationFilterDTO from '@data/models/notifications/notification-filter-dto';
import WarningDTO from '@data/models/notifications/warning-dto';
import { getPaginationUrlGetParams } from '@data/utils/pagination-aux';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public paginationConfig = {
    length: 10,
    pageSize: 10,
    page: 0,
    totalPages: 0,
    first: true,
    last: false
  };
  private readonly NOTIFICATIONS_PATH = '/api/notifications';
  private readonly INFO_WARNINGS_PATH = '/infoWarnings';
  private readonly LIST_MENTIONS_PATH = '/listMentions';
  private readonly LIST_BY_FILTER_PATH = '/listByFilter';
  private readonly READ_MENTION_PATH = '/readMention';
  private readonly READ_NOTIFICATION_PATH = '/readNotification';
  private readonly NO_READ_MENTION_PATH = '/noReadMention';
  private readonly NO_READ_NOTIFICATION_PATH = '/noReadNotification';
  private readonly SEARCH_NOTIFICATIONS = '/search';
  private readonly SEARCH_MENTIONS = '/searchMentions';
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private unreadMentionsCountSubject = new BehaviorSubject<number>(0);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public unreadNotificationsCount$ = this.unreadCountSubject.asObservable();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public unreadMentionsCount$ = this.unreadMentionsCountSubject.asObservable();

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public getInfoWarnings(data: WarningDTO): Observable<WarningDTO> {
    return this.http
      .post<WarningDTO>(`${this.env.apiBaseUrl}${this.NOTIFICATIONS_PATH}${this.INFO_WARNINGS_PATH}`, data)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public getNotifications(notificationFilter: NotificationFilterDTO): Observable<NotificationDataListDTO[]> {
    return this.http
      .post<NotificationDataListDTO[]>(
        `${this.env.apiBaseUrl}${this.NOTIFICATIONS_PATH}${this.LIST_BY_FILTER_PATH}`,
        notificationFilter
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public searchNotifications(
    filter: NotificationFilterDTO,
    pagination?: PaginationRequestI
  ): Observable<PaginationResponseI<NotificationDataListDTO>> {
    return this.http
      .post<PaginationResponseI<NotificationDataListDTO>>(
        `${this.env.apiBaseUrl}${this.NOTIFICATIONS_PATH}${this.SEARCH_NOTIFICATIONS}${getPaginationUrlGetParams(
          pagination,
          true
        )}`,
        filter
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public getMentions(type: 'READ' | 'NO_READ' | 'ALL'): Observable<MentionDataListDTO[]> {
    return this.http
      .get<MentionDataListDTO[]>(`${this.env.apiBaseUrl}${this.NOTIFICATIONS_PATH}${this.LIST_MENTIONS_PATH}/${type}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public searchMentions(
    filter: MentionFilterDTO,
    pagination?: PaginationRequestI
  ): Observable<PaginationResponseI<MentionDataListDTO>> {
    return this.http
      .post<PaginationResponseI<MentionDataListDTO>>(
        `${this.env.apiBaseUrl}${this.NOTIFICATIONS_PATH}${this.SEARCH_MENTIONS}${getPaginationUrlGetParams(pagination, true)}`,
        filter
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public markMentionAsRead(cardInstanceCommentId: number): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.env.apiBaseUrl}${this.NOTIFICATIONS_PATH}${this.READ_MENTION_PATH}/${cardInstanceCommentId}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public markNotificationAsRead(notificationId: number): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.env.apiBaseUrl}${this.NOTIFICATIONS_PATH}${this.READ_NOTIFICATION_PATH}/${notificationId}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public markMentionAsNoRead(cardInstanceCommentId: number): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.env.apiBaseUrl}${this.NOTIFICATIONS_PATH}${this.NO_READ_MENTION_PATH}/${cardInstanceCommentId}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public markNotificationAsNoRead(notificationId: number): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.env.apiBaseUrl}${this.NOTIFICATIONS_PATH}${this.NO_READ_NOTIFICATION_PATH}/${notificationId}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public updateUnreadCount(filter: any): void {
    this.searchNotifications(filter, this.paginationConfig)
      .pipe(take(1))
      .subscribe((data: PaginationResponseI<NotificationDataListDTO>) => {
        const unread = data.totalElements;
        this.unreadCountSubject.next(unread);
      });
  }

  public updateUnreadMentionsCount(): void {
    this.searchMentions({ readFilterType: 'NO_READ' }, this.paginationConfig)
      .pipe(take(1))
      .subscribe((data: PaginationResponseI<MentionDataListDTO>) => {
        const unread = data.totalElements;
        this.unreadMentionsCountSubject.next(unread);
      });
  }

  public resetUnreadCount(): void {
    this.unreadCountSubject.next(0);
  }
}
