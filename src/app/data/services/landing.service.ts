import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import LandingConfigDTO from '@data/models/landing/landing-config-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LandingService {
  private readonly LANDING_PATH = '/api/landing';
  private readonly CONFIG_PATH = '/config';
  private readonly GET_CONFIG_PATH = '/getEditConfig';
  private readonly SAVE_CONFIG_PATH = '/saveConfig';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public getLandingConfig(): Observable<LandingConfigDTO> {
    return this.http
      .get<LandingConfigDTO>(`${this.env.apiBaseUrl}${this.LANDING_PATH}${this.CONFIG_PATH}${this.GET_CONFIG_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public saveLandingCofnig(landingConfig: LandingConfigDTO): Observable<LandingConfigDTO> {
    return this.http
      .post<LandingConfigDTO>(
        `${this.env.apiBaseUrl}${this.LANDING_PATH}${this.CONFIG_PATH}${this.SAVE_CONFIG_PATH}`,
        landingConfig
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
