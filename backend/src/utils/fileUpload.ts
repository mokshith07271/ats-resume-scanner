import multer from 'multer';
import path from 'path';
import { storage } from '../config/firebase';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedTypes.includes(ext)) {
      cb(new Error('Only PDF and DOCX files are allowed'));
      return;
    }

    cb(null, true);
  },
});

export const uploadSingle = upload.single('resume');
export const uploadMultiple = upload.array('resumes', 5);
