import Actor from '../models/Actor.js';

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
    Actor.findOne({ _id: req.params._id }).then(actor => {
        if (!actor) {
            return res.status(404).send({
                message: "Actor not found with _id " + req.params._id
            });
        }
        res.send(actor.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: "Error retrieving Actor with _id " + req.params._id
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

