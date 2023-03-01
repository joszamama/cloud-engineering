import mongoose from "mongoose";

const SponsorshipSchema = new mongoose.Schema({
    banner: {type: String, required: [true, "can't be blank"]},
    link: {type: String, required: [true, "can't be blank"]},
    isPaid: {type: Boolean, default: false},
    actor: {type: mongoose.Schema.Types.ObjectId, ref: 'Actor'},
    trip: {type: mongoose.Schema.Types.ObjectId, ref: 'Trip'}
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

export default mongoose.model('Sponsorship', SponsorshipSchema)