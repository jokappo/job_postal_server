import ApplicationModel from "../models/Application.model.js";
import JobModel from "../models/Job.model.js";

//@desc Apply to a job
export const applyToJob = async (req, res) => {
    try {
        
    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        });
    }
}

//@desc get loggin user's applications
export const getMyApplications = async (req, res) => {
    try {
        
    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        });
    }
}

//@desc get applicants for a specific job(for employers)
export const getApplicantsForJob = async (req, res) => {
    try {
        
    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        });
    }
}

//@desc get application by id(jobseekers and employers)
export const getApplicationById = async (req, res) => {
    try {
        
    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        })
    }
}

//@desc update application status(for employers)
export const updateStatus = async (req, res) => {
    try {
        
    } catch (error) {
        return res.status(500).json({
            error: true,
            success: false,
            message: error.message || error
        })
    }
}