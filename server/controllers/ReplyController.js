import * as service from '../services/ReplyService.js';

export function addReply(req, res) {
    service.addReply(req, res);
}

export function updateReply(req, res) {
    service.updateReply(req, res);
}

export function banReply(req, res) {
    service.banReply(req, res);
}