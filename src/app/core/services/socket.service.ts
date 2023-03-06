import { Injectable } from '@angular/core';
import * as Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import { environment } from '@env';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private MAX_ATTEMTS_TO_SUBSCRIBE = 10;
  private stompClient: Stomp.Client;
  // private subscriptions: { eventName: string; observable: Observable<Stomp.Message> } = {};

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // this.http.get<any>(`${environment.socketUrl}/info`).subscribe({
    //   next: (d) => console.log(d),
    //   error: (err) => console.log(err)
    // });
  }

  public emitEvent(eventName: string, message: string): void {
    // this.socket.emit(eventName);
    if (this.getIsConnected()) {
      this.stompClient.send(eventName, {}, message);
    }
  }

  public onEvent(eventName: string): Observable<Stomp.Message> {
    // return this.socket.fromEvent(eventName);
    // return of(null);
    console.log(this.stompClient.connected, this.stompClient.counter, this.stompClient.subscriptions);
    return new Observable((observer) => {
      if (this.getIsConnected()) {
        this.stompClient.subscribe(eventName, (data: Stomp.Message) => {
          console.log(data);
          observer.next(data);
        });
      } else {
        console.log('Stomp error: trying to subscribe but not connected yet. ');
        this.initializeWebSocketConnection().then((connected) => {
          if (connected) {
            this.stompClient.subscribe(eventName, (data: Stomp.Message) => {
              console.log(data);
              observer.next(data);
            });
          } else {
            console.error('Stomp error: impossible to connect');
          }
        });
      }
    });
  }

  public unsubscribe(eventName: string): void {}

  public getIsConnected(): boolean {
    return this.stompClient?.connected;
  }

  public disconect(): void {
    this.stompClient.disconnect(() => {
      console.log('disconnected');
    });
  }

  public initializeWebSocketConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.getIsConnected()) {
        resolve(true);
      }
      const ws = new SockJS(environment.socketUrl);

      this.stompClient = Stomp.over(ws);
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      // const that = this;
      this.stompClient.connect(
        {},
        (frame: Stomp.Frame) => {
          resolve(true);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          // that.stompClient.subscribe('/topic/newcomment', (data: any) => {
          //   console.log(data);
          // });
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }
}
