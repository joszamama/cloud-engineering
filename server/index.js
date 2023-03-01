import server from './server.js';
import mongoose from 'mongoose';
import Configuration from './models/Configuration.js';
import admin from "firebase-admin";

const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'production';
console.log("Env: ", env)

// Your web app's Firebase configuration
const firebaseConfig = JSON.parse(Buffer.from(process.env.FIREBASE_CREDENTIALS, 'base64').toString());

// Initialize Firebase
admin.initializeApp({credential: admin.credential.cert(firebaseConfig)})

mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE_URL ?? 'mongodb://127.0.0.1:27017/default-db', {
  autoIndex: env === 'production' ? false : true 
  
  /* Don't build indexes in production, as it will slow down every write operation.
  In development, it's useful to have the indexes built so that operations are as performant as possible.
  In production, it's better to disable autoIndex and build the indexes manually (e.g. using the Mongo shell).
  More info: https://mongoosejs.com/docs/guide.html#indexes */

}).then(async () => {
  console.log(`Connected to database: ${process.env.DATABASE_URL ?? 'mongodb://127.0.0.1:27017/default-db'}`);
  await Configuration.find({}).then(async cfgs => cfgs?.length === 0 ? await Configuration.create({}) : null);
  await server.deploy(env).catch(err => console.log(err));
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
