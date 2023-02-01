import mongoose from 'mongoose';
const bcrypt = require("bcrypt");
var uniqueValidator = require('mongoose-unique-validator');

const ActorSchema = new mongoose.Schema({
    name: {type: String, required: [true, "can't be blank"]},
    surname: {type: String, required: [true, "can't be blank"]},
    email: {type: String, lowercase: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], unique: true, index: true},
    role: {type: String, enum:["Administrator", "Manager", "Explorer"], ref: 'Role', required: [true, "can't be blank"]},
    password: {type: String, required: [true, "can't be blank"]},
    phone: {type: String, required: [true, "can't be blank"]},
    address: {type: String, required: [true, "can't be blank"]},
    banned: {type: Boolean, default: false},
    preferredLanguage: {type: String, enum:["en", "es"], default: "en"},
}, {timestamps: true});

ActorSchema.methods.cleanup = function() {
    return {
        id: this._id,
        name: this.name,
        surname: this.surname,
        email: this.email,
        role: this.role,
        phone: this.phone,
        address: this.address,
        banned: this.banned,
        preferredLanguage: this.preferredLanguage,
    };
}

ActorSchema.plugin(uniqueValidator, {message: 'is already taken.'});

ActorSchema.pre('save', function(next) {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(this.password, salt);
    this.password = hash;
    next();
});

module.exports = mongoose.model('Actor', ActorSchema)