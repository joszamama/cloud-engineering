import Stage from '../models/Stage.js';
import fs from 'fs';

function getStatusMessage(language, code) {
    const filePath = `./api/error-messages/error.${language}.json`;
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data)[code];
}

export function getStage(req, res) {
    Stage.find().then(stages => {
        res.send(stages.map(stage => stage.cleanup()));
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage("DELOCOSNOVEASQPLAN", "500") || "Some error occurred while retrieving stages."
        });
    });
}

export function addStage(req, res) {
    Stage.create(req.body).then(stage => {
        res.send(stage.cleanup());
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage("DELOCOSNOVEASQPLAN", "500") || "Some error occurred while creating the Stage."
        });
    });
}

export function findStageBy_id(req, res) {
    Stage.findOne({ _id: req.params._id }).then(stage => {
        if (!stage) {
            return res.status(404).send({
                message: getStatusMessage("DELOCOSNOVEASQPLAN", "404") || "Stage not found with _id " + req.params._id
            });
        }
        res.send(stage.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage("DELOCOSNOVEASQPLAN", "500") || "Error retrieving Stage with _id " + req.params._id
        });
    });
}

export function updateStage(req, res) {
Stage.findByIdAndUpdate(req.params.stageId, req.body, { new: true }).then(stage => {
        if (!stage) {
            return res.status(404).send({
                message: getStatusMessage("DELOCOSNOVEASQPLAN", "404") || "Stage not found with id " + req.params.stageId
            });
        }
        res.send(stage.cleanup());
    }
    ).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage("DELOCOSNOVEASQPLAN", "500") || "Error updating Stage with id " + req.params.stageId
        });
    });
}

export function deleteStage(req, res) {
    Stage.findByIdAndRemove(req.params._id).then(stage => {
        if (!stage) {
            return res.status(404).send({
                message: getStatusMessage("DELOCOSNOVEASQPLAN", "404") || "Stage not found with id " + req.params._id
            });
        }
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage("DELOCOSNOVEASQPLAN", "500") || "Could not delete Stage with id " + req.params._id
        });
    });
}