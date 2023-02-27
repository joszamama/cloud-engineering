import { SecurityError } from "@oas-tools/commons";
import Actor from "../models/Actor.js";
import admin from "firebase-admin";

/* Security handler for Firebase IdToken verification */
export async function verifyIdToken(token) {
    const regex = /^Bearer\s/;
    if (regex.test(token)) {
        return await admin.auth().verifyIdToken(token.replace(regex, ""))
            .then(decodedToken => decodedToken)
            .catch(error => { throw new SecurityError(error) });
    } else {
        throw new SecurityError("Invalid token provided");
    }
}

/* Check ownership function */
export async function checkOwnership(decoded, paramName, paramValue) {
    switch (paramName) {
        case "actorId":
            return await Actor.findOne({ _id: paramValue }).then(actor => actor?.email === decoded?.email) ?? false;
        case "applicationId":
            return false; //TODO implement
        case "finderId":
            return false; //TODO implement
        case "sponsorshipId":
            return false; //TODO implement
        case "ticker":
            return false; //TODO implement
        default:
            return false;
    }
}