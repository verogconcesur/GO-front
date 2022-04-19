import { Server } from 'miragejs';

export default () => {
  const s = new Server({
    models: {},

    factories: {},

    seeds(server) {},

    routes() {
      this.namespace = '/api';

      this.get('/healthcheck', (schema, request) => {
        return {
          status: 'ok'
        };
      });

      this.passthrough((request) => {
        return request.url.startsWith('./assets');
      });
    }
  });
};
