import http from "http";
import express from "express";
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initialize } from "@oas-tools/core";

dotenv.config();

const deploy = async () => {
    const serverPort = process.env.PORT || 8081;

    const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/test';
    const mongoOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    await mongoose.connect(mongoUri, mongoOptions);
    if (mongoose.connection.readyState !== 1) {
        console.log('Error connecting to database');
        process.exit(1);
    } else {
        console.log('Connected to database');
    }

    const app = express();
    app.use(express.json({limit: '50mb'}));

    const config = {
        middleware: {
            security: {
                auth: {
                }
            }
        }
    }

    
    initialize(app, config).then(() => {
        http.createServer(app).listen(serverPort, () => {
        console.log("\nApp running at http://localhost:" + serverPort);
        console.log("________________________________________________________________");
        if (config.middleware.swagger?.disable !== false) {
            console.log('API docs (Swagger UI) available on http://localhost:' + serverPort + '/docs');
            console.log("________________________________________________________________");
        }
        });
    });
}

const undeploy = () => {
  process.exit();
};

export default {deploy, undeploy}

