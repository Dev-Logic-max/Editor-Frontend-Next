"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Dialog } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut } from "lucide-react";

interface CroppedArea {
  width: number;
  height: number;
  x: number;
  y: number;
}

export default function ImageCropModal() {
  const [image, setImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setOpen(true);
    };
    reader.readAsDataURL(file);
    console.log("handle file change 1", file)
    console.log("handle file change 2", reader)
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: CroppedArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", (err) => reject(err));
      img.setAttribute("crossOrigin", "anonymous");
      img.src = url;
    });

  const getCroppedImg = useCallback(
    async (imageSrc: string, crop: CroppedArea): Promise<string | null> => {
      const image = await createImage(imageSrc);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return null;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      return canvas.toDataURL("image/jpeg");
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!image || !croppedAreaPixels) return;

    try {
      const cropped = await getCroppedImg(image, croppedAreaPixels);
      if (cropped) {
        setCroppedImage(cropped);
        console.log("handle crop file", cropped)
        // setOpen(false); // close after save
      }
    } catch (e) {
      console.error(e);
    }
  }, [image, croppedAreaPixels, getCroppedImg]);

  return (
    <div className="flex flex-row items-start justify-center h-screen bg-gray-100 p-8 gap-8 relative">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold mb-4">Upload Avatar</h1>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-sm cursor-pointer rounded-md p-2 text-gray-600 bg-gray-200 hover:bg-gray-300 transition"
        />
      </div>

      {/* Cropped preview */}
      {croppedImage && (
        <div className="flex flex-col items-center gap-2 z-50 right-4 absolute top-6">
          <h1 className="font-medium text-gray-700">Preview:</h1>
          <img
            src={croppedImage}
            alt="Cropped"
            className="w-80 rounded-md border border-gray-300 object-cover"
          />
        </div>
      )}

      {/* Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/60" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-sm shadow-2xl w-[420px] max-w-full overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-gray-300 px-4 py-2">
              <Dialog.Title className="text-lg font-semibold text-gray-800">
                Position and size your new avatar
              </Dialog.Title>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Crop Area */}
            <div className="relative bg-gray-200 w-full aspect-square overflow-hidden">
              {image && (
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  showGrid={false}
                  cropShape="rect"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  objectFit="contain"
                  style={{
                    containerStyle: { backgroundColor: "#f3f4f6" },
                    cropAreaStyle: {
                      border: "2px solid white",
                      boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                    },
                  }}
                />
              )}
            </div>

            {/* Controls */}
            <div className="border-b-2 py-4 border-gray-300">
              <div className="flex items-center justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-l-sm rounded-r-none border-gray-300"
                  onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-r-sm rounded-l-none border-gray-300"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end p-3">
              <Button
                className="rounded-sm bg-blue-800/80 hover:bg-blue-800"
                onClick={handleSave}
              >
                Set new profile picture
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
