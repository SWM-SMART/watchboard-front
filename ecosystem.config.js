module.exports = {
  apps: [
    {
      name: 'watchboard-front',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      exec_mode: 'cluster',
    },
  ],
};
