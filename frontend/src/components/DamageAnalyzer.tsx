import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileImage,
  DollarSign,
} from "lucide-react";
import type { ImageWithDamageProps ,Report} from "../types/damageTypes";

const ImageWithDamage: React.FC<ImageWithDamageProps> = ({ src, damages = [] }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 1, height: 1 });

  const updateDimensions = () => {
    if (imgRef.current) {
      setImgSize({
        width: imgRef.current.clientWidth,
        height: imgRef.current.clientHeight,
      });
      setNaturalSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  };

  useEffect(() => {
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div className="relative inline-block">
      <img
        ref={imgRef}
        src={src}
        alt="Vehicle"
        onLoad={updateDimensions}
        className="block max-w-full h-auto rounded-xl shadow-md"
      />

      {imgSize.width > 0 &&
        damages.map((dmg, idx) => {
          const scaleX = imgSize.width / naturalSize.width;
          const scaleY = imgSize.height / naturalSize.height;

          // Convert rectangle to points if no points array
          const points = dmg.points ?? (dmg.x !== undefined && dmg.y !== undefined && dmg.width && dmg.height
            ? [
                { x: dmg.x, y: dmg.y },
                { x: dmg.x + dmg.width, y: dmg.y },
                { x: dmg.x + dmg.width, y: dmg.y + dmg.height },
                { x: dmg.x, y: dmg.y + dmg.height },
              ]
            : undefined);

          if (!points) return null;

          const pointsString = points.map(p => `${p.x * scaleX},${p.y * scaleY}`).join(" ");

          return (
            <svg
              key={idx}
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <polygon
                points={pointsString}
                fill="rgba(239, 68, 68, 0.2)"
                stroke="red"
                strokeWidth={2}
              >
                <title>{dmg.class}</title>
              </polygon>
            </svg>
          );
        })}
    </div>
  );
};

const DamageAnalyzer: React.FC = () => {
  const [pickupFile, setPickupFile] = useState<File | null>(null);
  const [returnedFile, setReturnedFile] = useState<File | null>(null);

  const [beforeImageUrl, setBeforeImageUrl] = useState<string | null>(null);
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null);

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!pickupFile || !returnedFile) {
      setError("Please upload both images");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("pickup", pickupFile);
    formData.append("returned", returnedFile);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setReport(res.data.report);
      setBeforeImageUrl(URL.createObjectURL(pickupFile));
      setAfterImageUrl(URL.createObjectURL(returnedFile));
    } catch (err) {
      setError("Failed to analyze images. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const FileUploadBox = ({
    label,
    file,
    onChange,
  }: {
    label: string;
    file: File | null;
    onChange: (file: File | null) => void;
  }) => (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
          ${file ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"}`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {file ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-green-700">{file.name}</p>
                <p className="text-xs text-green-600">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-600">Click or drag to upload</p>
            <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );

  // Convert rectangular damages to points if needed
  const damagesWithPoints = report?.newDamages.map(dmg => {
    if (dmg.points) return dmg;
    if (dmg.x !== undefined && dmg.y !== undefined && dmg.width && dmg.height) {
      return {
        class: dmg.class,
        points: [
          { x: dmg.x, y: dmg.y },
          { x: dmg.x + dmg.width, y: dmg.y },
          { x: dmg.x + dmg.width, y: dmg.y + dmg.height },
          { x: dmg.x, y: dmg.y + dmg.height },
        ],
      };
    }
    return dmg;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vehicle Damage Analyzer</h1>
          <p className="text-gray-600">Upload before and after images to detect and analyze damage</p>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <FileUploadBox label="Pickup Image" file={pickupFile} onChange={setPickupFile} />
            <FileUploadBox label="Returned Image" file={returnedFile} onChange={setReturnedFile} />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!pickupFile || !returnedFile || loading}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all transform
              ${!pickupFile || !returnedFile || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FileImage className="w-5 h-5" /> Analyze Damage
              </span>
            )}
          </button>
        </div>

        {report && beforeImageUrl && afterImageUrl && (
          <div className="bg-white shadow-2xl rounded-2xl p-8 animate-fadeIn space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-green-600" /> Analysis Complete
            </h2>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Estimated Cost</h3>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                ${report.estimatedCostRange[0].toLocaleString()} - ${report.estimatedCostRange[1].toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 grid md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <p className="font-semibold mb-2 text-gray-700">Before (Pickup)</p>
                <ImageWithDamage src={beforeImageUrl!} />
              </div>

              <div className="flex flex-col items-center">
                <p className="font-semibold mb-2 text-gray-700">After (Returned)</p>
                <ImageWithDamage src={afterImageUrl!} damages={damagesWithPoints} />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-700">{report.summary}</p>
            </div>

            {/* Damage count */}
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg font-semibold">
              <AlertCircle className="w-5 h-5" />
              {report.newDamages.length} damage{report.newDamages.length !== 1 ? "s" : ""} detected
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DamageAnalyzer;
