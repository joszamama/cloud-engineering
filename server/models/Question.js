import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    trip: {type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true},
    text: {type: String, required: true, maxlength: 500, minlength: 1},
    replies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Reply', required: true, default: []}],
    date: {type: Date, required: true, default: Date.now},
    isBanned: {type: Boolean, required: true, default: false},
    justification: {type: String, maxlength: 500, minlength: 1},
}, {timestamps: true});

QuestionSchema.methods.cleanup = function() {
    
    return {
        id: this._id,
        owner: this.owner ? this.owner._id : "Anonymous",
        trip: this.trip,
        text: this.text,
        replies: this.replies,
        date: this.date,
        isBanned: this.isBanned,
        justification: this.justification,
    };
}

export default mongoose.model('Question', QuestionSchema)