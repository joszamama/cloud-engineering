import * as auth from "./utils/auth.js";

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
            auth: { apikey: (token) => auth.verifyIdToken(token) }
        },
        swagger: { disable: false, path: "/docs", ui: { customCss: null, customJs: null } },
        error: { disable: false, printStackTrace: false, customHandler: null },
        external: {
            OASBearerJWT: { checkOwnership: (decoded, paramName, paramValue) => auth.checkOwnership(decoded, paramName, paramValue) }
        }
    }
}