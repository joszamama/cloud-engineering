import * as service from '../services/StageService.js';

export function getStage(req, res) {
    service.getStage(req, res);
}

export function addStage(req, res) {
    service.addStage(req, res);
}

export function findStageBy_id(req, res) {
    service.findStageBy_id(req, res);
}

export function updateStage(req, res) {
    service.updateStage(req, res);
}

export function deleteStage(req, res) {
    service.deleteStage(req, res);
}

