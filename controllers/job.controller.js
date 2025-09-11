import ApplicationModel from "../models/Application.model.js";
import JobModel from "../models/Job.model.js";
import SaveJobModel from "../models/SavedJob.model.js";
import UserModel from "../models/user.model.js";

//@desc Create a new job(employer)
export const createJob = async (req, res) => {
  try {
    //const { title, description, requirements, location, salary } = req.body;

    // 1. Vérification du rôle de l'utilisateur
    if (req.user.role !== "employer") {
      return res.status(403).json({
        success: false,
        message: "Seuls les employeurs peuvent créer des offres d'emploi.",
      });
    }

    /* // 2. Vérification des champs obligatoires
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Le titre et la description de l'emploi sont obligatoires.",
      });
    } */

    // 3. Création et sauvegarde de l'offre d'emploi en une seule étape
    const job = await JobModel.create({
      ...req.body,
      company: req.user._id,
      /* title,
      description,
      requirements,
      location,
      salary,
      employer: req.user._id,*/
    });

    // 4. Réponse de succès
    return res.status(201).json({
      success: true,
      message: "L'offre d'emploi a été créée avec succès.",
      data: job,
    });
  } catch (error) {
    // 5. Gestion des erreurs du serveur ou de la base de données
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur serveur. Veuillez réessayer plus tard.",
    });
  }
};

//@desc Get all jobs (public)
export const getJobs = async (req, res) => {
  try {
    const { keyword, location, category, type, minSalary, maxSalary, userId } =
      req.query;

    const query = { isClosed: false };

    // Construction simplifiée de l'objet de requête
    if (keyword) query.title = { $regex: keyword, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };
    if (category) query.category = category;
    if (type) query.type = type;

    // Gestion de la fourchette de salaire de manière plus simple
    const salaryQuery = {};
    if (minSalary) salaryQuery.$gte = minSalary;
    if (maxSalary) salaryQuery.$lte = maxSalary;
    if (Object.keys(salaryQuery).length > 0) {
      query.salary = salaryQuery;
    }

    // Exécution de la requête de base
    const jobs = await JobModel.find(query)
      .populate("company", "name companyName companyLogo")
      .lean();

    // Si aucun emploi n'est trouvé, on renvoie une réponse immédiate
    if (jobs.length === 0) {
      return res.status(200).json({
        error: false,
        success: true,
        data: [],
        message: "Aucune offre d'emploi trouvée.",
      });
    }

    // Si l'utilisateur est authentifié, on enrichit les données
    if (userId) {
      // Exécution parallèle des requêtes pour plus de performance
      const [savedJobs, applications] = await Promise.all([
        SaveJobModel.find({ jobseeker: userId }).select("job").lean(),
        ApplicationModel.find({ applicant: userId })
          .select("job status")
          .lean(),
      ]);

      // Mappage des IDs sauvegardés et des statuts de candidature pour un accès rapide
      const savedJobIds = savedJobs.map((job) => job.job.toString());
      const appliedJobStatusMap = applications.reduce((map, app) => {
        map[app.job.toString()] = app.status;
        return map;
      }, {});

      // Enrichissement des données des emplois
      const jobsWithStatus = jobs.map((job) => {
        const jobIdStr = job._id.toString();
        return {
          ...job,
          isSaved: savedJobIds.includes(jobIdStr),
          applicationStatus: appliedJobStatusMap[jobIdStr] || "not applied",
        };
      });

      return res.status(200).json({
        error: false,
        success: true,
        data: jobsWithStatus,
      });
    }

    // Si l'utilisateur n'est pas authentifié, on renvoie les emplois sans les données personnalisées
    return res.status(200).json({
      error: false,
      success: true,
      data: jobs,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || "Erreur interne du serveur.",
    });
  }
};

//@desc Get jobs for logged in user (Employer can see posted jobs)
export const getJobEmployer = async (req, res) => {
  try {
    const userId = req.user._id;
    const { role } = req.user;

    if (role !== "employer") {
      return res.status(403).json({
        error: true,
        success: false,
        message:
          "Accès refusé. Vous devez être un employeur pour voir ces offres.",
      });
    }

    //get all jobs posted by employer
    const jobs = await JobModel.find({ company: userId })
      .populate("company", "name companyName companyLogo")
      .lean();

    //count application for each job
    const jobWithApplicationCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await ApplicationModel.countDocuments({
          job: job._id,
        });
        return { ...job, applicationCount };
      })
    );

    //send response
    return res.status(200).json({
      error: false,
      success: true,
      data: jobWithApplicationCounts,
    });
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
    const { userId } = req.query;

    const job = await JobModel.findById(req.params.id)
      .populate("company", "name companyName companyLogo")
      .lean();
    if (!job) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "Offre d'emploi non trouvée.",
      });
    }

    let applicationStatus = null;
    if (userId) {
      const application = await ApplicationModel.findOne({
        job: job._id,
        applicant: userId,
      })
        .select("status")
        .lean();
      applicationStatus = application ? application.status : "not applied";
    }

    return res.json({
      error: false,
      success: true,
      data: {
        ...job,
        applicationStatus,
      },
    });
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
    const jobId = req.params.id;
    const userId = req.user._id;
    const updates = req.body;

    // Définir les champs autorisés à être mis à jour, en respectant tes noms de variables
    const allowedUpdates = [
      "tittle",
      "description",
      "requirement",
      "location",
      "category",
      "type",
      "salaryMin",
      "salaryMax",
      "isClosed",
    ];

    const requestedUpdates = Object.keys(updates);
    const isValidOperation = requestedUpdates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: "Champs de mise à jour invalides.",
      });
    }

    // Trouver et vérifier les droits d'accès en une seule requête
    const job = await JobModel.findOne({ _id: jobId, company: userId });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Offre d'emploi non trouvée ou accès refusé.",
      });
    }

    // Mettre à jour et sauvegarder l'offre
    Object.assign(job, updates);
    await job.save();

    return res.status(200).json({
      success: true,
      data: job,
      message: "Offre d'emploi mise à jour avec succès.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur serveur. Veuillez réessayer plus tard.",
    });
  }
};

//@desc delete a job (employer)
export const deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user._id;

    // Trouver et supprimer l'offre d'emploi en une seule étape.
    const job = await JobModel.findOneAndDelete({
      _id: jobId,
      company: userId,
    });

    // Vérifier si l'opération a réussi
    if (!job) {
      // Si "job" est null, l'offre d'emploi n'existe pas ou l'utilisateur n'est pas le propriétaire
      return res.status(404).json({
        success: false,
        message: "Offre d'emploi non trouvée ou accès refusé.",
      });
    }

    // Renvoyer la réponse de succès
    return res.status(200).json({
      success: true,
      message: "Offre d'emploi supprimée avec succès.",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || "Erreur serveur. Veuillez réessayer plus tard.",
    });
  }
};

//@desc toggle job status close/open (employer)
export const toggleCloseJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user._id;

    // Trouver et mettre à jour le document en une seule requête.
    // L'option { new: true } renvoie le document mis à jour.
    const job = await JobModel.findOneAndUpdate(
      { _id: jobId, company: userId },
      [{ $set: { isClosed: { $not: "$isClosed" } } }],
      { new: true }
    );

    // Vérifier si l'opération a réussi
    if (!job) {
      // Si "job" est null, cela signifie que l'offre d'emploi n'existe pas ou que l'utilisateur n'est pas le propriétaire.
      return res.status(404).json({
        success: false,
        message: "Offre d'emploi non trouvée ou accès refusé.",
      });
    }

    // Renvoyer la réponse de succès
    return res.status(200).json({
      success: true,
      data: job,
      message: `L'offre d'emploi est maintenant ${
        job.isClosed ? "fermée" : "ouverte"
      }.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur serveur. Veuillez réessayer plus tard.",
    });
  }
};
