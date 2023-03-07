import http from "http";
import express from "express";
import I18n from "./middleware/I18n.js";
import config from "./oastools.config.js";
import { initialize, use } from "@oas-tools/core";
import { OASBearerJWT } from "@oas-tools/auth/middleware";

const deploy = async () => {
    const serverPort = process.env.PORT || 8080;

    const app = express();
    app.use(express.json({limit: '50mb'}));
    
    /* External middlewares */
    use(function ContentType(_req, res, next) {res.header("Content-Type", "application/json"); next();}, {}, 1);
    use(I18n, {}, 2);
    use(function anonymousToken(req, res, next) { req.headers.authorization = req.headers.authorization ?? "Bearer anonymous"; next();}, {}, 3);
    use(OASBearerJWT, config.middleware.external.OASBearerJWT, 5)

    /* OAS Tools initialization */
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

