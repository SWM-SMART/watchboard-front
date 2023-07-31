import { worker } from './browser';

function initMocks() {
  worker.start({ onUnhandledRequest: 'bypass' });
  console.log('Mocks worker started');
}

initMocks();

export {};
