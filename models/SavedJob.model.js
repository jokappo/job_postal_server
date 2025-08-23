import mongoose from "mongoose";

const saveJobSchema= mongoose.Schema({
    jobseeker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    }
}, {timestamps: true})

const SaveJobModel= mongoose.model('SaveJob', saveJobSchema)

export default SaveJobModel;