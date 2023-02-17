import * as service from '../services/TripService.js';

export function getTrip(req, res) {
    service.getTrip(req, res);
}

export function addTrip(req, res) {
    service.addTrip(req, res);
}

export function findByTicker(req, res) {
    service.findByTicker(req, res);
}

export function updateTrip(req, res) {
    service.updateTrip(req, res);
}

export function deleteTrip(req, res) {
    service.deleteTrip(req, res);
}

