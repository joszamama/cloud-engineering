import mongoose from "mongoose";
import Actor from "./Actor.js";
import Trip from "./Trip.js";

const ApplicationSchema = new mongoose.Schema({
    status: { type: String, enum: ["PENDING", "REJECTED", "DUE", "ACCEPTED", "CANCELLED"], default: "PENDING" },
    rejectReason: { type: String },
    comments: { type: String },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Actor', required: [true, "can't be blank"] },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: [true, "can't be blank"] },
}, { timestamps: true });

ApplicationSchema.methods.cleanup = function () {
    return {
        id: this._id.toString(),
        status: this.status,
        rejectReason: this.rejectReason,
        comments: this.comments,
        createdAt: this.createdAt?.toISOString(),
        trip: this.trip?.toString(),
        actor: this.actor?.toString(),
    };
}

ApplicationSchema.pre('save', async function () {

    if (!this.rejectReason && this.status === "REJECTED") throw new Error("Reject reason is required when status is REJECTED");
    if (this.rejectReason && this.status !== "REJECTED") this.rejectReason = undefined;

    if (Object.keys(this.getChanges()?.["$set"] ?? {}).includes("createdAt")) { // New application
        await Actor.findByIdAndUpdate(this.actor, { $push: { applications: this._id } }).exec();
        await Trip.findByIdAndUpdate(this.trip, { $push: { applications: this._id } }).exec();
    }
});

ApplicationSchema.pre('findOneAndUpdate', async function (next) {
    const application = await this.model.findOne(this.getQuery());
    const newApplication = this.getUpdate();

    if (!this.rejectReason && this.status === "REJECTED") throw new Error("Reject reason is required when status is REJECTED");
    if (this.rejectReason && this.status !== "REJECTED") this.rejectReason = undefined;

    if (["DUE", "REJECTED"].includes(newApplication.status) && application.status === "PENDING") {
        if (newApplication.status === "REJECTED" && newApplication.rejectReason === undefined) throw new Error("Invalid application update");
        else next();
    } else if (application.status === "ACCEPTED" && newApplication.status === "CANCELLED" || application.status === "DUE" && newApplication.status === "ACCEPTED" || application.status === "PENDING" && newApplication.status === "CANCELLED") {
        next();
    } else {
        throw new Error("Invalid application update");
    }
}); 

ApplicationSchema.index({ actor: 1, status: 1 });

export default mongoose.model('Application', ApplicationSchema)