import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
    status: {type: String, enum:["PENDING", "REJECTED", "DUE", "ACCEPTED", "CANCELLED"], default: "PENDING"},
    rejectReason: {type: String},
    rejectComment: {type: String},
}, {timestamps: true});

ApplicationSchema.methods.cleanup = function() {
    return {
        id: this._id,
        status: this.status,
        rejectReason: this.rejectReason,
        rejectComment: this.rejectComment,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
}

module.exports = mongoose.model('Application', ApplicationSchema)