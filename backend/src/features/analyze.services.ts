import axios from "axios";
import { Damage, PRICE_MAP } from "./analyze.types";

export default class AnalyzeService {
  private iouThreshold = 0.3;

  async detectDamages(imageBuffer: Buffer, confidenceThreshold: number) {
    try {
      const base64Image = imageBuffer.toString("base64");

      const jsonResponse = await axios({
        method: "POST",
        url: process.env.ROBOFLOW_MODEL_URL!,
        params: {
          api_key: process.env.ROBOFLOW_API_KEY!,
          format: "json",
          confidence: confidenceThreshold,
        },
        data: base64Image,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const predictions = jsonResponse.data.predictions || [];
      return { predictions };
    } catch (err) {
      console.error("Error detecting damages:", err);
      return { predictions: [] };
    }
  }

  // IoU calculation
  private getIoU(a: Damage, b: Damage) {
    const xA = Math.max(a.x, b.x);
    const yA = Math.max(a.y, b.y);
    const xB = Math.min(a.x + a.width, b.x + b.width);
    const yB = Math.min(a.y + a.height, b.y + b.height);

    const interWidth = Math.max(0, xB - xA);
    const interHeight = Math.max(0, yB - yA);
    const interArea = interWidth * interHeight;

    const areaA = a.width * a.height;
    const areaB = b.width * b.height;

    return interArea / (areaA + areaB - interArea);
  }

  // Compare damages between pickup and returned images
  compareDamages(pickupDamages: Damage[], returnDamages: Damage[]) {
    const newDamages: Damage[] = [];
    let minCost = 0;
    let maxCost = 0;

    for (const r of returnDamages) {
      let isNew = true;

      for (const p of pickupDamages) {
        if (r.class === p.class && this.getIoU(r, p) > this.iouThreshold) {
          isNew = false;
          break;
        }
      }

      if (isNew) {
        newDamages.push(r);

        const priceRange = PRICE_MAP[r.class];
        if (priceRange) {
          minCost += priceRange[0];
          maxCost += priceRange[1];
        }
      }
    }

    return {
      newDamages,
      estimatedCostRange: [minCost, maxCost],
      summary: `${newDamages.length} new damages detected. Estimated cost between $${minCost} and $${maxCost}`,
    };
  }
}
