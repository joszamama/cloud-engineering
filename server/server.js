import http from "http";
import express from "express";
import config from "./oastools.config.js"
import { initialize } from "@oas-tools/core";

const deploy = async () => {
    const serverPort = process.env.PORT || 8080;

    const app = express();
    app.use(express.json({limit: '50mb'}));
  
    initialize(app, config).then(() => {
        http.createServer(app).listen(serverPort, () => {
        console.log("\nApp running at http://localhost:" + serverPort);
        console.log("________________________________________________________________");
        if (!config.middleware.swagger?.disable) {
            console.log('API docs (Swagger UI) available on http://localhost:' + serverPort + config.middleware.swagger.path);
            console.log("________________________________________________________________");
        }
        });
    });
}

const undeploy = () => {
  process.exit();
};

export default {deploy, undeploy}

