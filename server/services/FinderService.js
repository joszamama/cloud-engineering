import Finder from '../models/Finder.js';
import Configuration from '../models/Configuration.js';

export async function getFinder(req, res) {
    Finder.find(res.locals.oas.params.actor ? {actor: res.locals.oas.params?.actor} : {}).then(async finders => {
        res.send(await Promise.all(finders.map(finder => finder.cleanup())));
    }).catch(err => {
        console.log(err)
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function addFinder(req, res) {
    res.locals.oas.body.actor = res.locals.oas.security?.apikey.uid;

    Finder.create(res.locals.oas.body).then(finder => {
        res.status(201).send();
    }).catch(err => {
        console.log(err)
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function findFinderBy_id(req, res) {
    Finder.findOne({ _id: res.locals.oas.params._id }).then(async finder => {
        if (!finder) return res.status(404).send({ message: "Finder not found" });
        res.send(await finder.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function updateFinder(req, res) {
    Finder.findById(res.locals.oas.params._id,).then(finder => {
        if (!finder) return res.status(404).send({ message: "Finder Not Found" });

        delete res.locals.oas.body.actor;
        delete res.locals.oas.body.result;
        Object.keys(res.locals.oas.body).forEach(key => finder[key] = res.locals.oas.body[key]);

        finder.save();
        res.status(204).send();
    }
    ).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}

export function deleteFinder(req, res) {
    Finder.findByIdAndRemove(res.locals.oas.params._id).then(finder => {
        if (!finder) return res.status(404).send({ message: "Finder Not Found" });
        res.status(204).send();
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message
        });
    });
}