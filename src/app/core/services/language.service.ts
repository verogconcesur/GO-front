import { Injectable } from '@angular/core';
import { DEFAULT_I18N_LANG } from '@app/constants/global.constants';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  constructor(private translateService: TranslateService) {}

  public setDefaultLanguage(): void {
    this.translateService.setDefaultLang(DEFAULT_I18N_LANG);
  }

  public setLanguage(lang: string): void {
    const navigatorLanguage = navigator?.language?.substring(0, 2);

    this.translateService.use(lang ?? navigatorLanguage);
  }

  public getCurrentLanguage(): string {
    return this.translateService.currentLang;
  }
}
