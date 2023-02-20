import Configuration from '../models/Configuration.js';
import fs from 'fs';

function getStatusMessage(language, code) {
    const filePath = `./api/error-messages/error.${language ?? "en"}.json`;
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data)[code];
}

export function getConfig(req, res) {
    Configuration.find().then(configurations => {
        if (configurations?.length === 0) return res.status(404).send({ message: getStatusMessage(res.locals.oas.security?.apikey.language, "404") || "Configuration not found" });
        res.send(configurations[0].cleanup());
    }).catch(() => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage(res.locals.oas.security?.apikey.language, "500") || "Some error occurred while retrieving configurations."
        });
    });
}

export function updateConfig(req, res) {
    const config = res.locals.oas.body;
    Configuration.find({}).then(configurations => {
        if (configurations?.length === 0) return res.status(404).send({ message: getStatusMessage(res.locals.oas.security?.apikey.language, "404") || "Configuration not found" });
        const configuration = configurations[0];
        configuration.update(config).then(() => {
            res.status(204).send();
        }).catch(() => {
            res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
                message: getStatusMessage(res.locals.oas.security?.apikey.language, "500") || "Some error occurred while updating the configuration."
            });
        });
    });
}