import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationSoundService {
  private audio1: HTMLAudioElement;
  private audio2: HTMLAudioElement;
  private audio1Ready = false;
  private audio2Ready = false;
  private play1OnReady = false;
  private play2OnReady = false;
  constructor() {
    this.audio1 = new Audio('/assets/sounds/notification1.mp3');
    this.audio2 = new Audio('/assets/sounds/notification2.mp3');
    this.audio1.addEventListener('loadeddata', () => {
      this.audio1Ready = true;
      if (this.play1OnReady) {
        this.audio1.play();
      }
      this.play1OnReady = false;
    });
    this.audio2.addEventListener('loadeddata', () => {
      this.audio2Ready = true;
      if (this.play2OnReady) {
        this.audio2.play();
      }
      this.play2OnReady = false;
    });
    this.audio1.load();
    this.audio2.load();
  }

  public playSound(type: 'COMMENTS' | 'CLIENT_MESSAGES' | 'NOTIFICATION' | 'MENTION' | 'OTHER'): void {
    switch (type) {
      case 'COMMENTS':
      case 'CLIENT_MESSAGES':
        if (this.audio1Ready) {
          this.audio1.play();
        } else {
          this.play1OnReady = true;
        }
        break;
      default:
        if (this.audio2Ready) {
          this.audio2.play();
        } else {
          this.play2OnReady = true;
        }
    }
  }
}
