import mongoose from "mongoose";
import Question from "./Question.js";

const ReplySchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500, minlength: 1 },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    date: { type: Date, required: true, default: Date.now},
    isBanned: { type: Boolean, required: true, default: false },
    justification: { type: String, maxlength: 500, minlength: 1 },
}, { timestamps: true });

ReplySchema.methods.cleanup = function () {
    return {
        id: this._id,
        owner: this.owner,
        text: this.text,
        question: this.question,
        date: this.date,
        isBanned: this.isBanned,
        justification: this.justification,
    };
}

ReplySchema.pre('save', function (next) {
    const question = Question.findById(this.question);
    // compare this.date with question.date
    if (this.date < question.date) {
        return next(new Error('Reply date cannot be before question date'));
    } else {
        return next();
    }
});


export default mongoose.model('Reply', ReplySchema)