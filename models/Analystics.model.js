import mongoose from "mongoose";

const analyticsSchema = mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalJobsPosted: {
      type: Number,
      default: 0,
    },
    totalApplicationsReceived: {
      type: Number,
      default: 0,
    },
    totalHired: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const AnalyticsModel = mongoose.model("Analytics", analyticsSchema);

export default AnalyticsModel;
