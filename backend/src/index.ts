import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRouter from './features/analyze.route';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/analyze', analyzeRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
