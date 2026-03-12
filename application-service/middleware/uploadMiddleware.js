import multer from 'multer';
import path from 'path';

// 1. Switch to Memory Storage
// This holds the file in RAM as a Buffer, allowing us to pass it directly to Firebase
const storage = multer.memoryStorage();

// 2. Check file type (Only allow PDFs)
const checkFileType = (file, cb) => {
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Resumes must be PDFs only!'));
    }
};

// 3. Initialize upload variable
export const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});