import * as service from '../services/ActorService.js';

export function getActor(req, res) {
    service.getActor(req, res);
}

export function addActor(req, res) {
    service.addActor(req, res);
}

export function findBy_id(req, res) {
    service.findBy_id(req, res);
}

export function updateActor(req, res) {
    service.updateActor(req, res);
}

export function deleteActor(req, res) {
    service.deleteActor(req, res);
}

