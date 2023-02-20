import Trip from "../models/Trip.js";
import fs from 'fs';

function getStatusMessage(language, code) {
    const filePath = `./api/error-messages/error.${language?.slice(0, 2).toLowerCase() ?? "en"}.json`;
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data)[code];
}

export function getTrip(req, res) {

    if (res.locals.oas.params.search) {
        const regex = new RegExp(res.locals.oas.params.search, "i");

        if (res.locals.oas.params.exactMatch) {
            Trip.find({ $text: { $search: regex, $language: "none" } }, { score: { $meta: "textScore" } })
                .sort({ score: { $meta: 'textScore' } }).exec()
                .then(trips => {
                    res.send(trips.map(trip => trip.cleanup()));
                }).catch(err => {
                    res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
                        message: getStatusMessage(res.locals.oas.security.apikey.language, "500") || "Some error occurred while retrieving trips."
                    });
                });
        } else {
            Trip.find({ $or: [{ ticker: { $regex: regex } }, { title: { $regex: regex } }, { description: { $regex: regex } }] },).then(trips => {
                res.send(trips.map(trip => trip.cleanup()));
            }).catch(err => {
                res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
                    message: getStatusMessage(res.locals.oas.security.apikey.language, "500") || "Some error occurred while retrieving trips."
                });
            });
        }
    } else {
        Trip.find().then(trips => {
            res.send(trips.map(trip => trip.cleanup()));
        }).catch(err => {
            res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
                message: getStatusMessage(res.locals.oas.security.apikey.language, "500") || "Some error occurred while retrieving trips."
            });
        });
    }

}

export function addTrip(req, res) {
    Trip.create(req.body).then(trip => {
        res.send(trip.cleanup());
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage(res.locals.oas.security.apikey.language, "500") || "Some error occurred while creating the Trip."
        });
    });
}

export function findByTicker(req, res) {
    Trip.findOne({ ticker: req.params.ticker }).then(trip => {
        if (!trip) {
            return res.status(404).send({
                message: getStatusMessage(res.locals.oas.security.apikey.language, "404") || "Trip not found with ticker " + req.params.ticker
            });
        }
        res.send(trip.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage(res.locals.oas.security.apikey.language, "500") || "Error retrieving Trip with ticker " + req.params.ticker
        });
    });
}

export function updateTrip(req, res) {
    Trip.findByIdAndUpdate(req.params.tripId, req.body, { new: true }).then(trip => {
        if (!trip) {
            return res.status(404).send({
                message: getStatusMessage(res.locals.oas.security.apikey.language, "404") || "Trip not found with id " + req.params.tripId
            });
        }
        res.send(trip.cleanup());
    }
    ).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage(res.locals.oas.security.apikey.language, "500") || "Error updating Trip with id " + req.params.tripId
        });
    });
}

export function deleteTrip(req, res) {
    Trip.findByIdAndRemove(req.params.tripId).then(trip => {
        if (!trip) {
            return res.status(404).send({
                message: getStatusMessage(res.locals.oas.security.apikey.language, "404") || "Trip not found with id " + req.params.tripId
            });
        }
        res.send({ message: "Trip deleted successfully!" });
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: getStatusMessage(res.locals.oas.security.apikey.language, "500") || "Could not delete Trip with id " + req.params.tripId
        });
    });
}