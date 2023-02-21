import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
    status: { type: String, enum: ["PENDING", "REJECTED", "DUE", "ACCEPTED", "CANCELLED"], default: "PENDING" },
    rejectReason: { type: String },
    rejectComment: { type: String },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'Actor' },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
}, { timestamps: true });

ApplicationSchema.methods.cleanup = function () {
    return {
        id: this._id,
        status: this.status,
        rejectReason: this.rejectReason,
        rejectComment: this.rejectComment,
        createdAt: this.createdAt,
        trip: this.trip,
        actor: this.actor
    };
}

ApplicationSchema.index({ actor: 1, status: 1 });

export default mongoose.model('Application', ApplicationSchema)