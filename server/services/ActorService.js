import Actor from '../models/Actor.js';
import fs from 'fs';

function getStatusMessage(language, code) {
    const filePath = `./api/error-messages/error.${language?.slice(0,2).toLowerCase() ?? "en"}.json`;
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data)[code];
}

export function getActor(req, res) {
    Actor.find().then(actors => {
        res.send(actors.map(actor => actor.cleanup()));
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message || "Some error occurred while retrieving actors."
        });
    });
}

export function addActor(req, res) {
    Actor.create(req.body).then(actor => {
        res.send(actor.cleanup());
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message || "Some error occurred while creating the Actor."
        });
    });
}

export function findBy_id(req, res) {
    Actor.findOne({ _id: req.params._id }).then(async actor => {
        if (!actor) {
            return res.status(404).send({
                message: getStatusMessage(res.locals.oas.security.apikey.language, "404") || "Actor not found with _id " + req.params._id
            });
        }
        res.send(actor.cleanup());
    }).catch(async err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage(res.locals.oas.security.apikey.language, "500") || "Error retrieving Actor with _id " + req.params._id
        });
    });
}

export function updateActor(req, res) {
    Actor.findByIdAndUpdate(req.params.actorId, req.body, { new: true }).then(async actor => {
        if (!actor) {
            return res.status(404).send({
                message: getStatusMessage(res.locals.oas.security.apikey.language, "404") || "Actor not found with id " + req.params.actorId
            });
        }
        res.send(actor.cleanup());
    }
    ).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage(res.locals.oas.security.apikey.language, "500") || "Error updating Actor with id " + req.params.actorId
        });
    });
}

export function deleteActor(req, res) {
    Actor.findByIdAndRemove(req.params._id).then(actor => {
        if (!actor) {
            return res.status(404).send({
                message: getStatusMessage(res.locals.oas.security.apikey.language, "404") || "Actor not found with id " + req.params._id
            });
        }
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage(res.locals.oas.security.apikey.language, "500") || "Could not delete Actor with id " + req.params._id
        });
    });
}