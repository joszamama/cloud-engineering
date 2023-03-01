import * as service from '../services/TripService.js';

export function getTrip(req, res) {
    service.getTrip(req, res);
}

export function addTrip(req, res) {
    service.addTrip(req, res);
}

export function findBy_id(req, res) {
    service.findById(req, res);
}

export function updateTrip(req, res) {
    service.updateTrip(req, res);
}

export function deleteTrip(req, res) {
    service.deleteTrip(req, res);
}

