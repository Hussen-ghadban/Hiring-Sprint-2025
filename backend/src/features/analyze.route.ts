import express from 'express';
import multer from 'multer';
import { analyzeController } from './analyze.controller';

const router = express.Router();
const upload = multer();

router.post(
  '/',
  upload.fields([
    { name: 'pickup', maxCount: 1 },
    { name: 'returned', maxCount: 1 },
  ]),
  analyzeController
);

export default router;
