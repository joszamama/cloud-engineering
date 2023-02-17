import Stage from '../models/Stage.js';

export function getStage(req, res) {
    Stage.find().then(stages => {
        res.send(stages.map(stage => stage.cleanup()));
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message || "Some error occurred while retrieving stages."
        });
    });
}

export function addStage(req, res) {
    Stage.create(req.body).then(stage => {
        res.send(stage.cleanup());
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message || "Some error occurred while creating the Stage."
        });
    });
}

export function findStageBy_id(req, res) {
    Stage.findOne({ _id: req.params._id }).then(stage => {
        if (!stage) {
            return res.status(404).send({
                message: "Stage not found with _id " + req.params._id
            });
        }
        res.send(stage.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: "Error retrieving Stage with _id " + req.params._id
        });
    });
}

export function updateStage(req, res) {
Stage.findByIdAndUpdate(req.params.stageId, req.body, { new: true }).then(stage => {
        if (!stage) {
            return res.status(404).send({
                message: "Stage not found with id " + req.params.stageId
            });
        }
        res.send(stage.cleanup());
    }
    ).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: "Error updating Stage with id " + req.params.stageId
        });
    });
}

export function deleteStage(req, res) {
    Stage.findByIdAndRemove(req.params._id).then(stage => {
        if (!stage) {
            return res.status(404).send({
                message: "Stage not found with id " + req.params._id
            });
        }
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: "Error updating Stage with id " + req.params._id
        });
    });
}
