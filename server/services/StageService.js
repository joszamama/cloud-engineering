import Stage from '../models/Stage.js';

export function getStage(req, res) {
    Stage.find().then(stages => {
        res.send(stages.map(stage => stage.cleanup()));
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function addStage(req, res) {
    Stage.create(res.locals.oas.body).then(stage => {
        res.send(stage.cleanup());
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function findStageBy_id(req, res) {
    Stage.findOne({ _id: res.locals.oas.params._id }).then(stage => {
        if (!stage) return res.status(404).send({ message: "Stage not found" });
        res.send(stage.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function updateStage(req, res) {
    Stage.findByIdAndUpdate(res.locals.oas.params._id, res.locals.oas.body, { new: true }).then(stage => {
        if (!stage) return res.status(404).send({ message: "Stage Not Found" });
        res.send(stage.cleanup());
    }
    ).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function deleteStage(req, res) {
    Stage.findByIdAndRemove(res.locals.oas.params._id).then(stage => {
        if (!stage) return res.status(404).send({ message: "Stage Not Found" });
        res.status(204).send();
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}