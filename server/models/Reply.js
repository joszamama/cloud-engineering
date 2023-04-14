import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema({
    text: { type: String, required: [true, "can't be blank"]},
    banned: { type: Boolean, default: false},
    banReason: String,
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Actor' }
}, { timestamps: true });

ReplySchema.methods.cleanup = function () {
    return {
        id: this._id.toString(),
        text: this.text,
        banned: this.banned,
        ...(this.banned ? { banReason: this.banReason} : {}),
        question: this.question?.toString(),
        author: this.author?.toString(),
        createdAt: this.createdAt?.toISOString()
    };
}

export default mongoose.model('Reply', ReplySchema)