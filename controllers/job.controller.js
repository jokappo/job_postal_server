import applicationModel from "../models/Application.model.js";
import JobModel from "../models/Job.model.js";
import SaveJobModel from "../models/SavedJob.model.js";
import UserModel from "../models/user.model.js";

//@desc Create a new job(employer)
export const createJob = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};

//@desc Get all jobs (public)
export const getJobs = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};

//@desc Get jobs for logged in user (Employer can see posted jobs)
export const getJobEmployer = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};

//@desc get single job by id
export const getJobById = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};

//@desc update a job (employer)
export const updateJob = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};

//@desc delete a job (employer)
export const deleteJob = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};

//@desc toggle job status close/open (employer)
export const toggleJobStatus = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};
