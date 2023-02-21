import * as service from '../services/ConfigurationService.js';

export function getConfig(req, res) {
    service.getConfig(req, res);
}

export function updateConfig(req, res) {
    service.updateConfig(req, res);
}