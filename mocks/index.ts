async function initMocks() {
  if (typeof window === 'undefined') {
    const { server } = await import('./server');
    server.listen({ onUnhandledRequest: 'bypass' });
    console.log('Mocks server started');
  } else {
    const { worker } = await import('./browser');
    worker.start({ onUnhandledRequest: 'bypass' });
    console.log('Mocks worker started');
  }
}

initMocks();

export {};
