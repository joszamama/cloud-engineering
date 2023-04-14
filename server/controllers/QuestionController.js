import * as service from '../services/QuestionService.js';

export function getQuestion(req, res) {
    service.getQuestion(req, res);
}

export function addQuestion(req, res) {
    service.addQuestion(req, res);
}

export function updateQuestion(req, res) {
    service.updateQuestion(req, res);
}

export function banQuestion(req, res) {
    service.banQuestion(req, res);
}