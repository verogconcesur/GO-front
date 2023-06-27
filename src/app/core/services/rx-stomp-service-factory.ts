import { Env } from '@app/types/env';
import { rxStompConfig } from './rx-stomp.config';
import { RxStompService } from './rx-stomp.service';

export const rxStompServiceFactory = (env: Env) => {
  if (env.socketsEnabled) {
    const rxStomp = new RxStompService();
    rxStomp.configure(rxStompConfig);
    rxStomp.activate();
    return rxStomp;
  } else {
    return null;
  }
};
