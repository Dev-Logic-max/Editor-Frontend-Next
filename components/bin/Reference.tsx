"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useDocuments } from "@/hooks/useDocuments";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaFileAlt } from "react-icons/fa";
import { Volume2 } from "lucide-react"; 

const [isOpen, setIsOpen] = useState(false);
const { documents, fetchDocuments } = useDocuments();

useEffect(() => {
    fetchDocuments();
}, [fetchDocuments]);

{
    documents.map((doc) => (
        <Link
            key={doc._id}
            href={`/editor/${doc._id}`}
            className="block p-2 hover:bg-gray-100 rounded"
        >
            <FaFileAlt className="inline mr-2" /> {doc.title}
        </Link>
    ))
}

export const LoginModal = () => {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");

  const handleSendOtp = () => {
    if (!phone.trim()) {
      alert("Please enter your phone number");
      return;
    }
    console.log("Send OTP to:", phone);
    // you can trigger your API call here
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Login</Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Login with Phone</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <Input
            type="tel"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="text-center"
          />
          <Button onClick={handleSendOtp} className="w-full">
            Send OTP
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const PlaySoundButton = () => {
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

// app/editor/[id]/page.tsx

import { DocumentEditor } from '@/components/bin/DocumentEditor';
import { MotionDiv } from '@/components/common/MotionDiv';

export const EditorPage = ({ params }: { params: { id: string } }) => {
    return (
        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <DocumentEditor documentId={params.id} />
        </MotionDiv>
    );
}
