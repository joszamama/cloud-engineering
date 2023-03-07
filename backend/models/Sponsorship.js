import mongoose from "mongoose";
import Actor from "./Actor.js";
import Trip from "./Trip.js";

const SponsorshipSchema = new mongoose.Schema({
    banner: {type: String, required: [true, "can't be blank"]},
    link: {type: String, required: [true, "can't be blank"]},
    isPaid: {type: Boolean, default: false},
    actor: {type: mongoose.Schema.Types.ObjectId, ref: 'Actor', required: [true, "can't be blank"]},
    trip: {type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: [true, "can't be blank"]}
}, {timestamps: true});

SponsorshipSchema.methods.cleanup = function() {
    return {
        id: this._id,
        banner: this.banner,
        link: this.link,
        actor: this.actor,
        trip: this.trip
    };
}

SponsorshipSchema.pre('save', async function () {
    if (Object.keys(this.getChanges()?.["$set"] ?? {}).includes("createdAt")) {
        await Actor.findByIdAndUpdate(this.actor, { $push: { applications: this._id } }).exec();
        await Trip.findByIdAndUpdate(this.trip, { $push: { applications: this._id } }).exec();
    }
});

export default mongoose.model('Sponsorship', SponsorshipSchema)