import { server } from './server';

async function initMocks() {
  server.listen({ onUnhandledRequest: 'bypass' });
  console.log('Mocks server started');
}

initMocks();

export {};
