import ApplicationModel from "../models/Application.model.js";
import JobModel from "../models/Job.model.js";

//@desc Apply to a job
export const applyToJob = async (req, res) => {
  try {
    const role = req.user.role;
    const jobId = req.params.jobId;
    const userId = req.user._id;

    //  Validation du rôle
    if (role !== "jobseeker") {
      return res.status(403).json({
        error: true,
        success: false,
        message: "Seuls les demandeurs d'emploi peuvent postuler.",
      });
    }

    //  Exécuter les vérifications en parallèle pour améliorer la performance
    const [existingApplication, job] = await Promise.all([
      ApplicationModel.findOne({ job: jobId, applicant: userId }),
      JobModel.findById(jobId), // Méthode corrigée
    ]);

    //  Vérifier s'il y a déjà une candidature
    if (existingApplication) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Vous avez déjà postulé à cette offre d'emploi.",
      });
    }

    //  Vérifier si l'offre d'emploi existe
    if (!job) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Offre d'emploi non trouvée.",
      });
    }

    //  Créer et sauvegarder la candidature en une seule étape
    const application = await ApplicationModel.create({
      job: jobId,
      applicant: userId,
      resume: req.body.resume,
    });

    return res.status(201).json({
      error: false,
      success: true,
      message: "Candidature soumise avec succès.",
      data: application,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || "Une erreur inattendue est survenue.",
    });
  }
};

//@desc get loggin user's applications
export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user._id;
    const applications = await ApplicationModel.find({ applicant: userId })
      .populate("job", "tittle company location type")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      error: false,
      success: true,
      data: applications,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};

//@desc get applicants for a specific job(for employers)
export const getApplicantsForJob = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};

//@desc get application by id(jobseekers and employers)
export const getApplicationById = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};

//@desc update application status(for employers)
export const updateStatus = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || error,
    });
  }
};
