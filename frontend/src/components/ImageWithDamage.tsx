import React, { useRef, useState, useEffect } from "react";
import type { ImageWithDamageProps, Point } from "../types/damageTypes";

export const ImageWithDamage: React.FC<ImageWithDamageProps> = ({ src, damages = [] }) => {
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

  const scalePoint = (point: Point) => ({
    x: (point.x * imgSize.width) / naturalSize.width,
    y: (point.y * imgSize.height) / naturalSize.height,
  });

  return (
    <div className="relative inline-block">
      <img
        ref={imgRef}
        src={src}
        alt="Car"
        onLoad={updateDimensions}
        className="block max-w-full h-auto rounded-xl shadow-md"
      />

      {imgSize.width > 0 &&
        damages.map((dmg, idx) => {
          const scaledPoints = dmg.points!.map(scalePoint);
          const pointsString = scaledPoints.map(p => `${p.x},${p.y}`).join(" ");

          return (
            <svg
              key={idx}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            >
              <polygon
                points={pointsString}
                fill="rgba(239, 68, 68, 0.2)" 
                stroke="red"
                strokeWidth={2}
              />
            </svg>
          );
        })}
    </div>
  );
};
