"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { Dialog } from "@headlessui/react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  X,
  RotateCcw,
  RotateCw,
  RefreshCcw,
  FlipHorizontal,
} from "lucide-react";

export default function ImageEditorPage() {
  const [image, setImage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState(false);
  const [filter, setFilter] = useState("none");

  const cropperRef = useRef<any>(null);

  const onCropComplete = useCallback(() => {}, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlip(false);
    setFilter("none");
  };

  const handleRotateLeft = () => setRotation((r) => (r - 5 + 360) % 360);
  const handleRotateRight = () => setRotation((r) => (r + 5) % 360);
  const handleFlip = () => setFlip((f) => !f);

  // ---- Optional: export cropped image ----
  const handleSave = async () => {
    if (!image) return;
    // You can later implement canvas export here (optional)
    alert("Cropped image will be processed here.");
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <h1 className="text-2xl font-semibold mb-4">Upload & Edit Your Photo</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="text-sm cursor-pointer rounded-md p-2 text-gray-600 bg-gray-200 hover:bg-gray-300 transition"
      />

      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center border-b px-6 py-3 bg-gray-50">
              <Dialog.Title className="text-lg font-semibold text-gray-800">
                Edit Photo
              </Dialog.Title>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Body */}
            <div className="flex flex-col md:flex-row h-[600px]">
              {/* Cropper */}
              <div className="relative flex-1 bg-gray-100 overflow-hidden">
                {image && (
                  <div
                    className="relative w-full h-full"
                    style={{
                      transform: flip ? "scaleX(-1)" : "scaleX(1)",
                      filter: filter,
                      transition: "filter 0.3s ease, transform 0.3s ease",
                    }}
                  >
                    <Cropper
                      ref={cropperRef}
                      image={image}
                      crop={crop}
                      zoom={zoom}
                      rotation={rotation}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onRotationChange={setRotation}
                      onCropComplete={onCropComplete}
                      style={{
                        containerStyle: { backgroundColor: "#f3f4f6" },
                        cropAreaStyle: {
                          border: "2px solid white",
                          boxShadow:
                            "0 0 0 9999px rgba(0, 0, 0, 0.45)",
                        },
                      }}
                    />
                    {/* Rotation alignment line */}
                    {rotation !== 0 && (
                      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/60" />
                    )}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="w-full md:w-80 bg-gray-50 border-l flex flex-col justify-between">
                <div className="p-5 space-y-6 overflow-y-auto">
                  <h2 className="text-base font-semibold text-gray-700">
                    Adjust
                  </h2>

                  {/* Zoom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Zoom
                    </label>
                    <Slider
                      value={[zoom]}
                      min={1}
                      max={3}
                      step={0.1}
                      onValueChange={(val) => setZoom(val[0])}
                    />
                  </div>

                  {/* Straighten / Rotation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Straighten
                    </label>
                    <Slider
                      value={[rotation]}
                      min={-45}
                      max={45}
                      step={1}
                      onValueChange={(val) => setRotation(val[0])}
                    />
                    <div className="flex justify-between mt-3">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleRotateLeft}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleRotateRight}
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Flip */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Flip
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex gap-2 items-center justify-center"
                      onClick={handleFlip}
                    >
                      <FlipHorizontal className="w-4 h-4" />
                      {flip ? "Unflip" : "Flip Horizontally"}
                    </Button>
                  </div>

                  {/* Filters */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Filter
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        { name: "None", css: "none" },
                        { name: "Warm", css: "contrast(1.1) saturate(1.2)" },
                        { name: "Cool", css: "contrast(1.05) hue-rotate(15deg)" },
                        { name: "B&W", css: "grayscale(1)" },
                      ].map((f) => (
                        <Button
                          key={f.name}
                          variant={filter === f.css ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => setFilter(f.css)}
                        >
                          {f.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t p-4 flex justify-between bg-gray-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="flex items-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" /> Reset
                  </Button>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Photo</Button>
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
