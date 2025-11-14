"use client";

import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, X } from "lucide-react";
import { toast } from "react-toastify";

interface AvatarCropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onSave: (croppedImage: string) => void;
}

export default function AvatarCropModal({
  open,
  onOpenChange,
  imageUrl,
  onSave,
}: AvatarCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 1));

  const handleMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    setPosition({
      x: e.clientX - dragRef.current.x,
      y: e.clientY - dragRef.current.y,
    });
  };

  const handleMouseUp = () => {
    dragRef.current = null;
  };

  const handleSave = () => {
    toast.success("Profile picture updated!");
    onSave(imageUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[420px] p-0 rounded-lg overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <DialogHeader className="flex justify-between items-center border-b px-4 py-3">
          <DialogTitle className="text-[15px] font-medium">
            Position and size your new avatar
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        {/* Crop area */}
        <div className="flex justify-center items-center py-6 bg-gray-50">
          <div className="relative w-[260px] h-[260px] border-2 border-gray-300 rounded-sm overflow-hidden bg-[url('/transparent-bg.png')] bg-center bg-contain">
            <img
              src={imageUrl}
              alt="Avatar"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              }}
              onMouseDown={handleMouseDown}
              draggable={false}
              className="cursor-grab select-none transition-transform duration-100 ease-out"
            />
            <div className="absolute inset-0 border-2 border-[#94A3B8] rounded-sm pointer-events-none"></div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex justify-center items-center gap-4 pb-5">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            className="rounded-full border-gray-300"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            className="rounded-full border-gray-300"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 flex justify-end bg-gray-50">
          <Button onClick={handleSave} className="bg-[#2563EB] hover:bg-[#1E40AF]">
            Set new profile picture
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
