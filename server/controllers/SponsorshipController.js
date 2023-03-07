import * as service from '../services/SponsorshipService.js';

export function getSponsorship(req, res) {
    service.getSponsorship(req, res);
}

export function addSponsorship(req, res) {
    service.addSponsorship(req, res);
}

export function findSponsorshipBy_id(req, res) {
    service.findSponsorshipBy_id(req, res);
}

export function updateSponsorship(req, res) {
    service.updateSponsorship(req, res);
}

export function paySponsorship(req, res) {
    service.paySponsorship(req, res);
}

export function deleteSponsorship(req, res) {
    service.deleteSponsorship(req, res);
}

