import * as auth from "./utils/auth.js";

export default (env) => ({
    packageJSON: "package.json",
    oasFile: "api/oas-doc.yaml",
    useAnnotations: false,
    logger: {
        customLogger: null,
        level: env === "test" ? "off" : "info",
        logFile: false,
        logFilePath: "./logs/oas-tools.log"
    },
    middleware: { 
        router: { disable: false, controllers: "./controllers" },
        validator: { requestValidation: true, responseValidation: true, strict: true },
        security: { 
            disable: false, 
            auth: { apikey: (token) => auth.verifyIdToken(token) }
        },
        swagger: { disable: env === "test", path: "/docs", ui: { customCss: null, customJs: null } },
        error: { disable: false, printStackTrace: false, customHandler: null },
        external: {
            OASBearerJWT: { checkOwnership: (decoded, paramName, paramValue) => auth.checkOwnership(decoded, paramName, paramValue) }
        }
    }
})