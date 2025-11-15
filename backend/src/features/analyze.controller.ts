import { Request, Response } from "express";
import AnalyzeService from "./analyze.services";

const analyzeService = new AnalyzeService();

export const analyzeController = async (req: Request, res: Response) => {
  try {
    if (!req.files || !("pickup" in req.files) || !("returned" in req.files)) {
      return res.status(400).json({ error: "Missing images" });
    }

    const pickupFile = (req.files["pickup"][0] as Express.Multer.File).buffer;
    const returnFile = (req.files["returned"][0] as Express.Multer.File).buffer;

    const threshold = 0.3;

    const pickupResult = await analyzeService.detectDamages(pickupFile, threshold);
    const returnResult = await analyzeService.detectDamages(returnFile, threshold);

    const report = analyzeService.compareDamages(
      pickupResult.predictions,
      returnResult.predictions
    );

    res.status(200).json({
      pickup: pickupResult,
      returned: returnResult,
      report,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
