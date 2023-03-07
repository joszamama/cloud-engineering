import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const ActorSchema = new mongoose.Schema({
    name: { type: String, required: [true, "can't be blank"] },
    surname: { type: String, required: [true, "can't be blank"] },
    email: { type: String, lowercase: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], unique: true, index: true },
    role: { type: String, enum: ["Administrator", "Manager", "Explorer", "Sponsor"], required: [true, "can't be blank"] },
    password: { type: String, required: [true, "can't be blank"] },
    phone: {
        type: String,
        validate: {
            validator: function (v) {
                return /^(\+?\d{1,3}[\s-]?)?\(?\d{2,3}\)?[\s-]?\d{3}[\s-]?\d{2,3}[\s-]?\d{2}$/gm.test(v);
            }
        }
    },
    address: String,
    banned: { type: Boolean, default: false },
    preferredLanguage: { type: String, default: "English", enum: ["Arabic", "Chinese", "English", "German", "Italian", "Japanese", "Portuguese", "Russian", "Spanish"] },
    managedTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }],
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    sponsorships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sponsorship' }],
    finders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Finder' }]
}, { timestamps: true });

ActorSchema.methods.cleanup = function () {
    return {
        id: this._id.toString(),
        name: this.name,
        surname: this.surname,
        email: this.email,
        role: this.role,
        phone: this.phone,
        address: this.address,
        banned: this.banned,
        preferredLanguage: this.preferredLanguage,
        ...(this.role === "Manager" ? { managedTrips: this.managedTrips } : {}),
        ...(this.role === "Explorer" ? { applications: this.applications, finders: this.finders } : {}),
        ...(this.role === "Sponsor" ? { sponsorships: this.sponsorships } : {})
    };
}

ActorSchema.methods.authenticate = function (password) {
    return bcrypt.compareSync(password, this.password);
}

ActorSchema.pre('save', function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(this.password, salt);
    this.password = hash;
    next();
});

ActorSchema.pre('findOneAndUpdate', function (next) {
    if (!this._update.password) {
        return next();
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(this._update.password, salt);
    this._update.password = hash;
    next();
});

export default mongoose.model('Actor', ActorSchema)