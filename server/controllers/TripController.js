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

export function getQuestionsFromTrip(req, res) {
    service.getQuestionsFromTrip(req, res);
}

export function getQuestionsFromTripById(req, res) {
    service.getQuestionsFromTripById(req, res);
}

export function postQuestionFromTrip(req, res) {
    service.postQuestionFromTrip(req, res);
}

export function getQuestionsFromMyTrips(req, res) {
    service.getQuestionsFromMyTrips(req, res);
}

export function postReplyFromTrip(req, res) {
    service.postReplyFromTrip(req, res);
}

export function updateReplyFromTrip(req, res) {
    service.updateReplyFromTrip(req, res);
}

export function updateQuestionFromTrip(req, res) {
    service.updateQuestionFromTrip(req, res);
}