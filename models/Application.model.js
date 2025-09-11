import mongoose from "mongoose";

const applicationSchema = mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "job",
        required: true,
    },
     applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
     },
     resume: {
        type: String, //can store link or upoad version
     },
     status: {
        type: String,
        enum: ["Applied", "In Review", "Accepted", "Rejected"],
        default: "Applied",
     },
}, {timestamps: true})

const ApplicationModel = mongoose.model("Application", applicationSchema)
export default ApplicationModel