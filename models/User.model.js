import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["jobseeker", "employer"],
        required: true,
    },
    avatar: String,
    resume: String,
    //for employer
    companyName: {
        type: String,
        default: "",
    },
    companyDescription: {
        type: String,
        default: "",
    },
    companyLogo: {
        type: String,
        default: "",
    },
}, { timestamps: true })

//encrypt password
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

//compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

const UserModel = mongoose.model("User", UserSchema)
export default UserModel
