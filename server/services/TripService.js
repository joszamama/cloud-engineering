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
    Trip.findByIdAndUpdate(req.params.tripId, req.body, { new: true }).then(trip => {
        if (!trip) return res.status(404).send({ message: "Trip not found" });
        res.send(trip.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function deleteTrip(req, res) {
    Trip.findByIdAndRemove(req.params.tripId).then(trip => {
        if (!trip) return res.status(404).send({ message: "Trip not found" });
        res.send({ message: "Trip deleted successfully!" });
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}