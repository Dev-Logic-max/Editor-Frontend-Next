"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button"; 
import { Volume2 } from "lucide-react"; 

export default function PlaySoundButton() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // restart sound if already playing
      audioRef.current.play();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handlePlay} variant="outline">
        <Volume2 className="mr-2 h-4 w-4" />
        Play Notification Sound
      </Button>

      {/* Hidden audio element */}
      <audio ref={audioRef} src="/sounds/system-notification-199277.mp3" preload="auto" />
    </div>
  );
}
