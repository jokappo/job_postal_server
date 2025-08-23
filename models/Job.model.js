import mongoose from "mongoose";

const jobSchema = mongoose.Schema(
  {
    tittle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirement: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["Remote", "Full-Time", "Part-Time", "InternShip", "Contract"],
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, //employer
    salaryMin: {
      type: Number,
      required: true,
    },
    salaryMax: {
      type: Number,
      required: true,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const JobModel = mongoose.model("Job", jobSchema);
export default JobModel;
