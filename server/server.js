import http from "http";
import express from "express";
import I18n from "./middleware/I18n.js";
import config from "./oastools.config.js";
import { initialize, use } from "@oas-tools/core";

const deploy = async () => {
    const serverPort = process.env.PORT || 8081;

    const app = express();
    app.use(express.json({limit: '50mb'}));
    
    use(I18n);
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

