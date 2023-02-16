import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import MentionDataListDTO from '@data/models/notifications/mention-data-list-dto';
import NotificationDataListDTO from '@data/models/notifications/notification-data-list-dto';
import NotificationFilterDTO from '@data/models/notifications/notification-filter-dto';
import WarningDTO from '@data/models/notifications/warning-dto';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly NOTIFICATIONS_PATH = '/api/notifications';
  private readonly INFO_WARNINGS_PATH = '/infoWarnings';
  private readonly LIST_MENTIONS_PATH = '/listMentions';
  private readonly LIST_BY_FILTER_PATH = '/listByFilter';
  private readonly READ_MENTION_PATH = '/readMention';
  private readonly READ_NOTIFICATION_PATH = '/readNotification';

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

  public getMentions(type: 'READ' | 'NO_READ' | 'ALL'): Observable<MentionDataListDTO[]> {
    return this.http
      .get<MentionDataListDTO[]>(`${this.env.apiBaseUrl}${this.NOTIFICATIONS_PATH}${this.LIST_MENTIONS_PATH}/${type}`)
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
}
