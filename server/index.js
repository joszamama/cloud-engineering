import server from './server.js';

const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'production';

server.deploy(env).catch(err => { console.log(err); });

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint () {
  console.log(`[${new Date().toISOString()}] Got SIGINT (aka ctrl-c in docker). Graceful shutdown`);
  shutdown();
});

// quit properly on docker stop
process.on('SIGTERM', function onSigterm () {
  console.log(`[${new Date().toISOString()}] Got SIGTERM (docker container stop). Graceful shutdown`);
  shutdown();
});

const shutdown = () => {
  server.undeploy();
};
