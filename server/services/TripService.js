import Trip from "../models/Trip.js";
import fs from 'fs';

function getStatusMessage(language, code) {
    const filePath = `./api/error-messages/error.${language}.json`;
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data)[code];
}

export function getTrip(req, res) {
    Trip.find().then(trips => {
        res.send(trips.map(trip => trip.cleanup()));
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage("DELOCOSNOVEASQPLAN", "500") || "Some error occurred while retrieving trips."
        });
    });
}

export function addTrip(req, res) {
    Trip.create(req.body).then(trip => {
        res.send(trip.cleanup());
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage("DELOCOSNOVEASQPLAN", "500") || "Some error occurred while creating the Trip."
        });
    });
}

export function findByTicker(req, res) {
    Trip.findOne({ ticker: req.params.ticker }).then(trip => {
        if (!trip) {
            return res.status(404).send({
                message: getStatusMessage("DELOCOSNOVEASQPLAN", "404") || "Trip not found with ticker " + req.params.ticker
            });
        }
        res.send(trip.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage("DELOCOSNOVEASQPLAN", "500") || "Error retrieving Trip with ticker " + req.params.ticker
        });
    });
}

export function updateTrip(req, res) {
    Trip.findByIdAndUpdate(req.params.tripId, req.body, { new: true }).then(trip => {
        if (!trip) {
            return res.status(404).send({
                message: getStatusMessage("DELOCOSNOVEASQPLAN", "404") || "Trip not found with id " + req.params.tripId
            });
        }
        res.send(trip.cleanup());
    }
    ).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage("DELOCOSNOVEASQPLAN", "500") || "Error updating Trip with id " + req.params.tripId
        });
    });
}

export function deleteTrip(req, res) {
    Trip.findByIdAndRemove(req.params.tripId).then(trip => {
        if (!trip) {
            return res.status(404).send({
                message: getStatusMessage("DELOCOSNOVEASQPLAN", "404") || "Trip not found with id " + req.params.tripId
            });
        }
        res.send({ message: "Trip deleted successfully!" });
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage("DELOCOSNOVEASQPLAN", "500") || "Could not delete Trip with id " + req.params.tripId
        });
    });
}