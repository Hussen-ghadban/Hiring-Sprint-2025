import { Request, Response } from 'express';
import { compareDamages, detectDamages } from './analyze.services';

export const analyzeController = async (req: Request, res: Response) => {
  try {
    if (!req.files || !('pickup' in req.files) || !('returned' in req.files)) {
      return res.status(400).json({ error: 'Missing images' });
    }

    const pickupFile = (req.files['pickup'][0] as Express.Multer.File).buffer;
    const returnFile = (req.files['returned'][0] as Express.Multer.File).buffer;

    // fixed threshold at 30% (0.3)
    const threshold = 0.3;

    const pickupResult = await detectDamages(pickupFile, threshold);
    const returnResult = await detectDamages(returnFile, threshold);

    const report = compareDamages(pickupResult.predictions, returnResult.predictions);

    res.json({
      pickup: pickupResult,
      returned: returnResult,
      report,
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
