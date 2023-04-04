import { rxStompConfig } from './rx-stomp.config';
import { RxStompService } from './rx-stomp.service';

export const rxStompServiceFactory = () => {
  const rxStomp = new RxStompService();
  rxStomp.configure(rxStompConfig);
  rxStomp.activate();
  return rxStomp;
};
