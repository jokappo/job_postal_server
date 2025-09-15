import SaveJobModel from "../models/SavedJob.model.js";
import JobModel from "../models/Job.model.js";
import UserModel from "../models/user.model.js";

//@desc   Save a job for a jobseeker
export const saveJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user._id

    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Job not found",
      });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "User not found",
      });
    }

    const alreadySaved = await SaveJobModel.findOne({ jobseeker: userId, job: jobId });
    if (alreadySaved) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Job already saved",
      });
    }

    const savedJob = new SaveJobModel({
      jobseeker: userId,
      job: jobId,
    });

    await savedJob.save();

    res.status(201).json({
      error: false,
      success: true,
      data: savedJob,
      message: "Job saved successfully",
    });
    
  } catch (error) {
    console.error("Error saving job:", error);
    res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};

//@desc unsave a job for a jobseeker
export const unsaveJob = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error unsaving job:", error);
    res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};

//@desc get all saved jobs for a jobseeker
export const getMySavedJobs = async (req, res) => {
  try {
  } catch (error) {
    console.error("Error geting job:", error);
    res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};
