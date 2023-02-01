import mongoose from "mongoose";

const SponsorshipSchema = new mongoose.Schema({
    banner: {type: String, required: [true, "can't be blank"]},
    link: {type: String, required: [true, "can't be blank"]},
}, {timestamps: true});

SponsorshipSchema.methods.cleanup = function() {
    return {
        id: this._id,
        banner: this.banner,
        link: this.link,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
}

module.exports = mongoose.model('Sponsorship', SponsorshipSchema)