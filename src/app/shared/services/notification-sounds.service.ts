import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationSoundService {
  private audio1: HTMLAudioElement;
  private audio2: HTMLAudioElement;
  constructor() {
    this.audio1 = new Audio('/assets/sounds/notification1.mp3');
    this.audio2 = new Audio('/assets/sounds/notification2.mp3');
  }

  public playSound(type: 'COMMENTS' | 'CLIENT_MESSAGES' | 'NOTIFICATION' | 'MENTION' | 'OTHER'): void {
    switch (type) {
      case 'COMMENTS':
      case 'CLIENT_MESSAGES':
        this.audio1
          ?.play()
          .then(() => {
            //Played
          })
          .catch((error) => {
            console.error('Audio not played cause not interaction with the page');
          });
        break;
      default:
        this.audio2
          ?.play()
          .then(() => {
            //Played
          })
          .catch((error) => {
            console.error('Audio not played cause not interaction with the page');
          });
    }
  }
}
