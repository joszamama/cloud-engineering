import { bearerJwt } from "@oas-tools/auth/handlers";
import Actor from "./models/Actor.js";

export default {
    packageJSON: "package.json",
    oasFile: "api/oas-doc.yaml",
    useAnnotations: false,
    logger: {
        customLogger: null,
        level: "info",
        logFile: false,
        logFilePath: "./logs/oas-tools.log"
    },
    middleware: { 
        router: { disable: false, controllers: "./controllers" },
        validator: { requestValidation: true, responseValidation: true, strict: false },
        security: { 
            disable: false, 
            auth: { 
                apikey: bearerJwt({issuer: process.env.JWT_ISSUER ?? "default", secret: process.env.JWT_SECRET ?? "default"})
            } 
        },
        swagger: { disable: false, path: "/", ui: { customCss: null, customJs: null } },
        error: { disable: false, printStackTrace: false, customHandler: null },
        external: {
            OASBearerJWT: {
                checkOwnership: async (decoded, paramName, paramValue) => {
                    return await Actor.findOne({ [paramName]: paramValue }).then(actor => actor?.email === decoded?.email);
                }
            }
        }
    }
}