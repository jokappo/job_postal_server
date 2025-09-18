import JobModel from "../models/Job.model.js";
import ApplicationModel from "../models/Application.model.js";

const getTrend = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  // Correction: This line was missing. It calculates the percentage change.
  return Math.round(((current - previous) / previous) * 100);
};

export const getEmplyerAnalytics = async (req, res) => {
  try {
    // Correction: req.user.role is already a string, no need for destructuring.
    const role = req.user.role;
    const companyId = req.user._id;
    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);
    const prev7Days = new Date(now);
    prev7Days.setDate(now.getDate() - 14);

    if (role !== "employer") {
      return res.status(403).json({
        error: true,
        success: false,
        message: "Access denied",
      });
    }

    // A utility function to get job IDs, to avoid repetitive code
    const getJobIds = async () => {
        const jobs = await JobModel.find({ company: companyId }).select("_id").lean();
        return jobs.map(job => job._id);
    };
    
    // Correction: We need the job IDs before running other queries
    const jobIds = await getJobIds();


    //==================counts==================//
    const totalActiveJobs = await JobModel.countDocuments({
      company: companyId,
      isClosed: false,
    });
    // This query is now redundant as getJobIds() does the same thing
    const totalApplications = await ApplicationModel.countDocuments({
      job: { $in: jobIds },
    });
    const totalHired = await ApplicationModel.countDocuments({
      job: { $in: jobIds },
      status: "Accepted",
    });

    //==================trends==================//
    // active jobs post trend
    const activeJobsLast7Days = await JobModel.countDocuments({
      company: companyId,
      createdAt: { $gte: last7Days, $lt: now },
    });
    // active jobs prev trend
    const activeJobsPrev7Days = await JobModel.countDocuments({
      company: companyId,
      createdAt: { $gte: prev7Days, $lt: last7Days },
    });
    const activeJobsTrend = getTrend(activeJobsLast7Days, activeJobsPrev7Days);

    // Application trend
    const applicationsLast7Days = await ApplicationModel.countDocuments({
      job: { $in: jobIds },
      createdAt: { $gte: last7Days, $lt: now },
    });
    const applicationsPrev7Days = await ApplicationModel.countDocuments({
      job: { $in: jobIds },
      createdAt: { $gte: prev7Days, $lt: last7Days },
    });
    const applicantTrend = getTrend(
      applicationsLast7Days,
      applicationsPrev7Days
    );

    // hired application trend
    const hiredLast7Days = await ApplicationModel.countDocuments({
      job: { $in: jobIds },
      status: "Accepted",
      createdAt: { $gte: last7Days, $lt: now },
    });
    const hiredPrev7Days = await ApplicationModel.countDocuments({
      job: { $in: jobIds },
      status: "Accepted",
      createdAt: { $gte: prev7Days, $lt: last7Days },
    });
    const hiredTrend = getTrend(hiredLast7Days, hiredPrev7Days);

    //==================monthly applications==================//
    const monthlyApplications = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await ApplicationModel.countDocuments({
        job: { $in: jobIds },
        createdAt: { $gte: start, $lt: end },
      });
      monthlyApplications.push({
        month: start.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        count,
      });
    }

    //==================Data response==================//
    const recentJobs = await JobModel.find({ company: companyId })
      .sort({ createdAt: -1 })
      .select("tittle createdAt isClosed location type")
      .limit(5)
      .lean();

    const recentApplications = await ApplicationModel.find({ job: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .populate("applicant", "name email avatar resume")
      .populate("job", "tittle")
      .limit(5)
      .lean();

    res.status(200).json({
      error: false,
      success: true,
      counts: {
        totalActiveJobs,
        totalApplications,
        totalHired,
        trends: {
          activeJobs: activeJobsTrend,
          totalApplicants: applicantTrend,
          totalHired: hiredTrend,
        },
      },
      data: {
        recentJobs,
        recentApplications,
        monthlyApplications,
      }
    });
  } catch (error) {
    console.error("Error fetching employer analytics:", error);
    res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};