import Finder from '../models/Finder.js';

export function getFinder(req, res) {
    Finder.find().then(finders => {
        res.send(finders.map(finder => finder.cleanup()));
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message || "Some error occurred while retrieving finders."
        });
    });
}

export function addFinder(req, res) {
    Finder.create(req.body).then(finder => {
        res.send(finder.cleanup());
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message || "Some error occurred while creating the Finder."
        });
    });
}

export function findFinderBy_id(req, res) {
    Finder.findOne({ _id: req.params._id }).then(finder => {
        if (!finder) {
            return res.status(404).send({
                message: "Finder not found with _id " + req.params._id
            });
        }
        res.send(finder.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: "Error retrieving Finder with _id " + req.params._id
        });
    });
}

export function updateFinder(req, res) {
    Finder.findByIdAndUpdate(req.params.finderId, req.body, { new: true }).then(finder => {
        if (!finder) {
            return res.status(404).send({
                message: "Finder not found with id " + req.params.finderId
            });
        }
        res.send(finder.cleanup());
    }
    ).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: "Error updating Finder with id " + req.params.finderId
        });
    });
}

export function deleteFinder(req, res) {
    Finder.findByIdAndRemove(req.params._id).then(finder => {
        if (!finder) {
            return res.status(404).send({
                message: "Finder not found with id " + req.params._id
            });
        }
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: "Error updating Finder with id " + req.params._id
        });
    });
}
