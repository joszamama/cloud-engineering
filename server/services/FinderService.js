import Finder from '../models/Finder.js';

export function getFinder(req, res) {
    Finder.find().then(finders => {
        res.send(finders.map(finder => finder.cleanup()));
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function addFinder(req, res) {
    Finder.create(req.body).then(finder => {
        res.send(finder.cleanup());
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function findFinderBy_id(req, res) {
    Finder.findOne({ _id: req.params._id }).then(finder => {
        if (!finder) return res.status(404).send({ message: "Finder not found" });
        res.send(finder.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function updateFinder(req, res) {
    Finder.findByIdAndUpdate(req.params.finderId, req.body, { new: true }).then(finder => {
        if (!finder) return res.status(404).send({ message: "Finder Not Found" });
        res.send(finder.cleanup());
    }
    ).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function deleteFinder(req, res) {
    Finder.findByIdAndRemove(req.params._id).then(finder => {
        if (!finder) return res.status(404).send({ message: "Finder Not Found" });
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}