import Actor from '../models/Actor.js';
import fs from 'fs';

async function findUserByIdAndSelectLenguage(id) {
    let lenguage = "";
    await Actor.findById(id).then(actor => {
        lenguage = actor.preferredLanguage.slice(0, 2).toLowerCase()
    }).catch(err => {
        lenguage = "en";
    });
    return lenguage;
}

function getErrorMessages(language, code) {
    const filePath = `./api/error-messages/error.${language}.json`;
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
            let lenguage = await findUserByIdAndSelectLenguage(req.body._id);
            return res.status(404).send({
                message: getErrorMessages(lenguage, "404") || "Actor not found with _id " + req.params._id
            });
        }
        res.send(actor.cleanup());
    }).catch(async err => {
        let lenguage = await findUserByIdAndSelectLenguage(req.body._id);
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getErrorMessages(lenguage, "500") || "Error retrieving Actor with _id " + req.params._id
        });
    });
}

export function updateActor(req, res) {
    Actor.findByIdAndUpdate(req.params.actorId, req.body, { new: true }).then(actor => {
        if (!actor) {
            return res.status(404).send({
                message: "Actor not found with id " + req.params.actorId
            });
        }
        res.send(actor.cleanup());
    }
    ).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: "Error updating Actor with id " + req.params.actorId
        });
    });
}

export function deleteActor(req, res) {
    Actor.findByIdAndRemove(req.params._id).then(actor => {
        if (!actor) {
            return res.status(404).send({
                message: "Actor not found with id " + req.params._id
            });
        }
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: "Error updating Actor with id " + req.params._id
        });
    });
}

