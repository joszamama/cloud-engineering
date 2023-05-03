import mongoose from 'mongoose';
import Trip from './Trip.js';

const QuestionSchema = new mongoose.Schema({
    text: { type: String, required: [true, "can't be blank"]},
    banned: { type: Boolean, default: false},
    banReason: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Actor' },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }
}, { timestamps: true });

QuestionSchema.methods.cleanup = function () {
    return {
        id: this._id.toString(),
        text: this.text,
        banned: this.banned,
        ...(this.banned ? { banReason: this.banReason} : {}),
        author: this.author?.toString(),
        trip: this.trip?.toString(),
        createdAt: this.createdAt?.toISOString()
    };
}

QuestionSchema.pre('save', async function () {

    if (!this.banReason && this.banned === true) throw new Error("Ban reason is required when banned is true");
    if (this.banReason && this.banned !== true) this.banReason = undefined;

    if (Object.keys(this.getChanges()?.["$set"] ?? {}).includes("createdAt")) { // New question
        await Trip.findByIdAndUpdate(this.trip, { $push: { questions: this._id } }).exec();
    }
});

export default mongoose.model('Question', QuestionSchema)