import server from './server.js';
import mongoose from 'mongoose';

const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'production';
console.log("Env: ", env)

mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE_URL ?? 'mongodb://localhost:27017/default-db', {
  autoIndex: env === 'production' ? false : true 
  
  /* Don't build indexes in production, as it will slow down every write operation.
  In development, it's useful to have the indexes built so that operations are as performant as possible.
  In production, it's better to disable autoIndex and build the indexes manually (e.g. using the Mongo shell).
  More info: https://mongoosejs.com/docs/guide.html#indexes */

}).then(() => {
  console.log(`Connected to database: ${process.env.DATABASE_URL ?? 'mongodb://localhost:27017/default-db'}`);
  server.deploy(env).catch(err => console.log(err));
});

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint() {
  console.log(`[${new Date().toISOString()}] Got SIGINT (aka ctrl-c in docker). Graceful shutdown`);
  shutdown();
});

// quit properly on docker stop
process.on('SIGTERM', function onSigterm() {
  console.log(`[${new Date().toISOString()}] Got SIGTERM (docker container stop). Graceful shutdown`);
  shutdown();
});

const shutdown = () => {
  server.undeploy();
};
