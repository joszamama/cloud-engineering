import Sponsorship from '../models/Sponsorship.js';
import fs from 'fs';

function getStatusMessage(language, code) {
    const filePath = `./api/error-messages/error.${language}.json`;
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data)[code];
}

export function getSponsorship(req, res) {
    Sponsorship.find().then(sponsorships => {
        res.send(sponsorships.map(sponsorship => sponsorship.cleanup()));
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage("DELOCOSNOVEASQPLAN", "500") || "Some error occurred while retrieving sponsorships."
        });
    });
}

export function addSponsorship(req, res) {
    Sponsorship.create(req.body).then(sponsorship => {
        res.send(sponsorship.cleanup());
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage("DELOCOSNOVEASQPLAN", "500") || "Some error occurred while creating the Sponsorship."
        });
    });
}

export function findSponsorshipBy_id(req, res) {
    Sponsorship.findOne({ _id: req.params._id }).then(sponsorship => {
        if (!sponsorship) {
            return res.status(404).send({
                message: getStatusMessage("DELOCOSNOVEASQPLAN", "404") || "Sponsorship not found with _id " + req.params._id
            });
        }
        res.send(sponsorship.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage("DELOCOSNOVEASQPLAN", "500") || "Error retrieving Sponsorship with _id " + req.params._id
        });
    });
}

export function updateSponsorship(req, res) {
    Sponsorship.findByIdAndUpdate(req.params.sponsorshipId, req.body, { new: true }).then(sponsorship => {
        if (!sponsorship) {
            return res.status(404).send({
                message: getStatusMessage("DELOCOSNOVEASQPLAN", "404") || "Sponsorship not found with id " + req.params.sponsorshipId
            });
        }
        res.send(sponsorship.cleanup());
    }
    ).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage("DELOCOSNOVEASQPLAN", "500") || "Error updating Sponsorship with id " + req.params.sponsorshipId
        });
    });
}

export function deleteSponsorship(req, res) {
    Sponsorship.findByIdAndRemove(req.params._id).then(sponsorship => {
        if (!sponsorship) {
            return res.status(404).send({
                message: getStatusMessage("DELOCOSNOVEASQPLAN", "404") || "Sponsorship not found with id " + req.params._id
            });
        }
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage("DELOCOSNOVEASQPLAN", "500") || "Could not delete Sponsorship with id " + req.params._id
        });
    });
}
