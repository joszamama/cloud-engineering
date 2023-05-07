import { populateDB as populate } from "../populateDB.js";

export function populateDB(_, res) {
    return populate().then(() => {
        res.status(201).send();
    }).catch((err) => {
        res.status(500).send({message: "Error populating database: " + err});
    });
}