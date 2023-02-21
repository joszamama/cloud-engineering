import { OASBase } from "@oas-tools/commons"
import fs from "fs";

export default class I18n extends OASBase {
    constructor(oasDoc, middleware) {
        super(oasDoc, middleware);
    }

    static initialize(oasDoc, config) {
        function getStatusMessage(language, code) {
            const filePath = `./api/i18n/status.${language?.slice(0,2).toLowerCase() ?? "en"}.json`;
            const data = fs.readFileSync(filePath, "utf-8");
            return JSON.parse(data)[code];
        }

        return new I18n(oasDoc, (_req, res, next) => {
            const language = res.locals.oas.security?.apikey.language;
            const oldSend = res.send;

            res.send = (body) => {
                const data = JSON.parse(body);
                if (data.message) data.message = getStatusMessage(language, res.statusCode);
                oldSend.call(res, JSON.stringify(data));
            }

            next();
        });
    }

}

