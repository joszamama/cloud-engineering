import Actor from '../models/Actor.js';

export function getActor(req, res) {
    Actor.find().then(actors => {
        res.send(actors.map(actor => actor.cleanup()));
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function addActor(req, res) {
    Actor.create(req.body).then(actor => {
        res.send(actor.cleanup());
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function findBy_id(req, res) {
    Actor.findOne({ _id: req.params._id }).then(async actor => {
        if (!actor) return res.status(404).send({ message: "Actor not found" });
        res.send(actor.cleanup());
    }).catch(async err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function updateActor(req, res) {
    Actor.findByIdAndUpdate(req.params.actorId, req.body, { new: true }).then(async actor => {
        if (!actor) return res.status(404).send({ message: "Actor Not Found" });
        res.send(actor.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function deleteActor(req, res) {
    Actor.findByIdAndRemove(req.params._id).then(actor => {
        if (!actor)  return res.status(404).send({ message: "Actor Not Found" });
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}