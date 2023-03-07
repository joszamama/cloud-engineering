import { OASBase } from "@oas-tools/commons"
import fs from "fs";

export default class I18n extends OASBase {
    constructor(oasDoc, middleware) {
        super(oasDoc, middleware);
    }

    static initialize(oasDoc, config) {
        function translate(language, key) {
            const filePath = `./api/i18n/status.${language?.slice(0,2).toLowerCase() ?? "en"}.json`;
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, "utf-8");
                return JSON.parse(data)[key];
            }
        }

        return new I18n(oasDoc, (req, res, next) => {
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = token ? JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()) : null;
            const language = decoded?.language ?? req.acceptsLanguages()[0]?.replace(/es/i, "sp");
            const oldSend = res.send;

            res.send = (body) => {
                if (body) {
                    const data = typeof body === "string" ? JSON.parse(body) : body;
                    if (data.message) data.message = translate(language, res.statusCode) ?? data.message;
                    if (data.error) data.error = translate(language, res.statusCode) ?? data.error;
                    oldSend.call(res, JSON.stringify(data));
                } else {
                    oldSend.call(res, body);
                }
            }

            /* Overrides send for error handler, too */
            res.defaultSend = res.send;

            next();
        });
    }

}

