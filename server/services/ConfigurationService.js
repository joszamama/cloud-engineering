import Configuration from '../models/Configuration.js';

export function getConfig(_req, res) {
    Configuration.find().then(configurations => {
        if (configurations?.length === 0) return res.status(404).send({ message: "Config not found" });
        res.send(configurations[0].cleanup());
    }).catch(() => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function updateConfig(_req, res) {
    const config = res.locals.oas.body;
    Configuration.find({}).then(configurations => {
        if (configurations?.length === 0) return res.status(404).send({ message: "Config not found" });
        const configuration = configurations[0];
        configuration.update(config).then(() => {
            res.status(204).send();
        }).catch(() => {
            res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
                message: err.message
            });
        });
    });
}