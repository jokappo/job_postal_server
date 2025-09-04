import multer from "multer"

// configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
})

// file filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 
        'image/png', 
        'image/jpg', 
        'application/pdf'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Le fichier est accepté
    } else {
        // En cas d'erreur, renvoyer un message clair
        cb(new Error('Only .jpeg, .jpg, .png, and .pdf formats are allowed.'), false);
    }
}

const upload = multer({
    storage,
    fileFilter
});

export default upload;