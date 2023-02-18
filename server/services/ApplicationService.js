import Application from '../models/Application.js';

export function getApplication(req, res) {
    Application.find().then(applications => {
        res.send(applications.map(application => application.cleanup()));
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message || "Some error occurred while retrieving applications."
        });
    });
}

export function addApplication(req, res) {
    Application.create(req.body).then(application => {
        res.send(application.cleanup());
    }).catch(err => {
        res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: err.message || "Some error occurred while creating the Application."
        });
    });
}

export function findApplicationBy_id(req, res) {
    Application.findOne({ _id: req.params._id }).then(application => {
        if (!application) {
            return res.status(404).send({
                message: "Application not found with _id " + req.params._id
            });
        }
        res.send(application.cleanup());
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: "Error retrieving Application with _id " + req.params._id
        });
    });
}

export function updateApplication(req, res) {
    Application.findByIdAndUpdate(req.params.applicationId, req.body, { new: true }).then(application => {
        if (!application) {
            return res.status(404).send({
                message: "Application not found with id " + req.params.applicationId
            });
        }
        res.send(application.cleanup());
    }
    ).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: "Error updating Application with id " + req.params.applicationId
        });
    });
}

export function deleteApplication(req, res) {
    Application.findByIdAndRemove(req.params._id).then(application => {
        if (!application) {
            return res.status(404).send({
                message: "Application not found with id " + req.params._id
            });
        }
    }).catch(err => {
        return res.status(500).send({ // TODO: Realizar gestión del código y mensaje de error
            message: "Error updating Application with id " + req.params._id
        });
    });
}

