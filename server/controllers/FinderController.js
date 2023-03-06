import * as service from '../services/FinderService.js';

export function getFinder(req, res) {
    service.getFinder(req, res);
}

export function addFinder(req, res) {
    service.addFinder(req, res);
}

export function findFinderBy_id(req, res) {
    service.findFinderBy_id(req, res);
}

export function updateFinder(req, res) {
    service.updateFinder(req, res);
}

export function deleteFinder(req, res) {
    service.deleteFinder(req, res);
}