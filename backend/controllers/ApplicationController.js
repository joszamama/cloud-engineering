import * as service from '../services/ApplicationService.js';

export function getApplication(req, res) {
    service.getApplication(req, res);
}

export function addApplication(req, res) {
    service.addApplication(req, res);
}

export function findApplicationBy_id(req, res) {
    service.findApplicationBy_id(req, res);
}

export function updateApplication(req, res) {
    service.updateApplication(req, res);
}

export function payApplication(req, res) {
    service.payApplication(req, res);
}

export function cancelApplication(req, res) {
    service.cancelApplication(req, res);
}

export function deleteApplication(req, res) {
    service.deleteApplication(req, res);
}

