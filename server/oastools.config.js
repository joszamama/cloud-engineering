import Actor from "./models/Actor.js";
import admin from "firebase-admin";

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
                apikey: async (token) => {
                    return await admin.auth().verifyIdToken(token.replace("Bearer ", ""))
                    .then(decodedToken => decodedToken)
                }
            }
        },
        swagger: { disable: false, path: "/docs", ui: { customCss: null, customJs: null } },
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