import Application from "../models/Application.js";
import Trip from "../models/Trip.js";

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
                        message: err.message
                    });
                });
        } else {
            Trip.find({ $or: [{ ticker: { $regex: regex } }, { title: { $regex: regex } }, { description: { $regex: regex } }] },).then(trips => {
                res.send(trips.map(trip => trip.cleanup()));
            }).catch(err => {
                res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
                    message: err.message
                });
            });
        }
    } else {
        Trip.find().then(trips => {
            res.send(trips.map(trip => trip.cleanup()));
        }).catch(err => {
            res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
                message: err.message
            });
        });
    }
}

export function addTrip(req, res) {
    Trip.create(req.body).then(trip => {
        res.send(trip.cleanup());
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function findByTicker(req, res) {
    Trip.findOne({ ticker: req.params.ticker }).then(trip => {
        if (!trip) return res.status(404).send({ message: "Trip not found" });
        res.send(trip.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function updateTrip(req, res) {
    Trip.findById(req.params._id, req.body).then(async trip => {

        if (!trip) return res.status(404).send({ message: "Trip not found" });
        if (trip.isPublished) {
            const applications = await Application.find({ trip: trip._id, status: "ACCEPTED" }) ?? [];
            if (new Date() < new Date(trip.startDate) || applications.length > 0) {
                return res.status(400).send({ message: "The trip has started or has applications accepted" });
            } else {
                return res.status(400).send({ message: "Trip cannot be modified after being published" });
            }
        }    
        await trip.save();
        res.status(204).send();
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function deleteTrip(req, res) {
    Trip.findById(req.params.tripId).then(async trip => {
        if (!trip) return res.status(404).send({ message: "Trip not found" });
        if (trip.isPublished) return res.status(400).send({ message: "Trip cannot be modified after being published" });
        await trip.delete();
        res.status(204).send();
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}