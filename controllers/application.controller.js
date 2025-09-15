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
      resume: req.user.resume || "",
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
    console.error(error);
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
    const jobId = req.params.jobId;
    const userId = req.user._id;
    const { role } = req.user;

    // Validation de l'utilisateur : Seuls les employeurs sont autorisés
    if (role !== "employer") {
      return res.status(403).json({
        success: false,
        message:
          "Accès refusé. Seuls les employeurs peuvent voir les candidats.",
      });
    }

    // Vérification de l'appartenance de l'offre d'emploi
    // On s'assure que l'offre existe ET qu'elle appartient à l'employeur connecté.
    const job = await JobModel.findOne({ _id: jobId, company: userId }).lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Offre d'emploi non trouvée ou accès non autorisé.",
      });
    }

    // Récupération des candidatures
    const applications = await ApplicationModel.find({ job: jobId })
      .populate("applicant", "name email avatar resume")
      .populate("job", "tittle company location type")
      .lean();

    // Gestion du cas où il n'y a pas de candidatures
    // Renvoyer 200 avec un tableau vide est plus sémantique que 404.
    if (applications.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Aucun candidat trouvé pour cette offre d'emploi.",
      });
    }

    // Réponse finale
    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur interne du serveur.",
    });
  }
};

//@desc get application by id(jobseekers and employers)
export const getApplicationById = async (req, res) => {
  try {
    const userId = req.user._id;
    const appId = req.params.id;

    const app = await ApplicationModel.findById(appId)
      .populate("job", "title company location type")
      .populate("applicant", "name email avatar resume")
      .lean();

    if (!app) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Candidature non trouvée.",
      });
    }

    const isOwner = app.applicant._id.toString() === userId.toString();
    const isEmployer = app.job.company.toString() === userId.toString();

    if (!isOwner && !isEmployer) {
      return res.status(403).json({
        error: true,
        success: false,
        message:
          "Accès refusé. Vous n'êtes pas autorisé à voir cette candidature.",
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      data: app,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || "Erreur interne du serveur.",
    });
  }
};

//@desc update application status(for employers)
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appId = req.params.id;
    const userId = req.user._id;
    const { role } = req.user;

    // Valider le rôle en premier pour éviter une requête inutile
    if (role !== "employer") {
      return res.status(403).json({
        error: true,
        success: false,
        message: "Seuls les employeurs peuvent mettre à jour le statut.",
      });
    }

    // Valider les valeurs de statut autorisées
    const validStatuses = ["Applied", "In Review", "Accepted", "Rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: true,
        success: false,
        message: `Statut de candidature invalide. Les statuts valides sont : ${validStatuses.join(
          ", "
        )}.`,
      });
    }

    // Chercher la candidature et vérifier l'appartenance
    const app = await ApplicationModel.findById(appId).populate("job", "company");

    // Cette vérification s'assure que l'employeur est bien le propriétaire de l'offre
    if (!app || app.job.company.toString() !== userId.toString()) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Candidature non trouvée ou accès non autorisé.",
      });
    }

    // Mettre à jour et sauvegarder en une seule étape
    const updatedApp = await ApplicationModel.findByIdAndUpdate(
      appId,
      { status },
      { new: true } // Renvoie le document mis à jour
    )
      .populate("job", "title company location type")
      .populate("applicant", "name email avatar resume")
      .lean();

    // Renvoyer la réponse avec les données complètes
    return res.status(200).json({
      error: false,
      success: true,
      data: updatedApp,
      message: `Statut de candidature mis à jour avec succès. status : ${status}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || "Une erreur inattendue est survenue.",
    });
  }
};
