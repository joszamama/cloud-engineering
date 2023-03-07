import mongoose from "mongoose";

const StageSchema = new mongoose.Schema({
    title: {type: String, required: [true, "can't be blank"]},
    description: {type: String, required: [true, "can't be blank"]},
    price: {type: Number, required: [true, "can't be blank"]}
}, {timestamps: true});

StageSchema.methods.cleanup = function() {
    return {
        id: this._id,
        title: this.title,
        description: this.description,
        price: this.price
    };
}

export const Stage = StageSchema;