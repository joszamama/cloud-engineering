import Reply from "../models/Reply.js";
import Actor from "../models/Actor.js";
import Application from "../models/Application.js";
import Question from "../models/Question.js";


export async function addReply(req, res) {
    let role = res.locals.oas.security?.apikey.role;

    if (role === "Explorer") {
        res.locals.oas.body.author = res.locals.oas.security?.apikey.uid;
        let actor = await Actor.findById(res.locals.oas.security?.apikey.uid);
        let applications = await Application.find({ actor: actor._id, status: "ACCEPTED" });
        let question = await Question.findById(res.locals.oas.body.question);

        if (res.locals.oas.body.question && !applications.map(application => application.trip.toString()).includes(question.trip).toString()) {
            return res.status(400).send({ message: "You have not enjoyed this trip, so you can't reply about it." });
        } else if (!res.locals.oas.body.question) {
            return res.status(400).send({ message: "QuestionId is required" });
        } else {
            res.locals.oas.body.actor = actor._id;
            Reply.create(res.locals.oas.body).then(async () => {
                res.status(201).send();
            }).catch(err => {
                console.log(err.message)
                res.status(500).send({
                    message: err.message
                });
            });
        }
    } else if (role === "Manager") {
        res.locals.oas.body.author = res.locals.oas.security?.apikey.uid;
        Reply.create(res.locals.oas.body).then(async () => {
            res.status(201).send();
        }).catch(err => {
            console.log(err.message)
            res.status(500).send({
                message: err.message
            });
        });
    }
}

export function updateReply(req, res) {

    Reply.findById(res.locals.oas.params._id).then(async reply => {

        if (!reply) return res.status(404).send({ message: "Reply not found" });
        Object.keys(res.locals.oas.body).forEach(key => reply[key] = res.locals.oas.body[key]);
        reply.save().then(async () => {
            res.status(204).send();
        }).catch(err => {
            return res.status(500).send({
                message: err.message
            });
        });

    }).catch(err => {
        console.log(err)
        return res.status(500).send({
            message: err.message
        });
    });
}

export function banReply(req, res) {
    Reply.findById(res.locals.oas.params._id).then(async reply => {
        if (!reply) return res.status(404).send({ message: "Reply not found" });
        reply.banned = true;
        reply.save().then(async () => {
            res.status(204).send();
        }).catch(err => {
            return res.status(500).send({
                message: err.message
            });
        });
    }).catch(err => {
        console.log(err)
        return res.status(500).send({
            message: err.message
        });
    });
}