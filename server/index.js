import server from './server.js';
import mongoose from 'mongoose';

const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'production';

mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE_URL ?? 'mongodb://localhost:27017/default-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  server.deploy(env).catch(err => console.log(err));
});

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
