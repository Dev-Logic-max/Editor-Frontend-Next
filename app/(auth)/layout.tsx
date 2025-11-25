'use client';

import { FloatingIcon } from "@/components/animations/FloatingIcon";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen relative items-center justify-center mx-auto px-4 py-8 bg-linear-to-br from-purple-400/40 via-pink-400/40 to-teal-400/40 animate-gradient">
      {/* 🎨 Floating Editor Icons 🖌️ */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon lib="ri" name="Bold" delay={0} left="6%" top="18%" />
        <FloatingIcon lib="ri" name="Italic" delay={1} left="72%" top="16%" />
        <FloatingIcon lib="ri" name="H1" delay={2} left="12%" top="84%" />
        <FloatingIcon lib="ri" name="ListUnordered" delay={3} left="80%" top="65%" />
        <FloatingIcon lib="ri" name="Link" delay={4} left="22%" top="60%"/>
        <FloatingIcon lib="fc" name="EditImage" delay={5} left="70%" top="40%" />
        <FloatingIcon lib="ri" name="CodeBoxLine" delay={6} left="30%" top="30%" />
        <FloatingIcon lib="ri" name="TableLine" delay={7} left="60%" top="84%" />
        <FloatingIcon lib="pi" name="TextAa" delay={8} left="15%" top="35%" />
        <FloatingIcon lib="fc" name="Document" delay={9} left="88%" top="10%" />
        <FloatingIcon lib="fc" name="Calendar" delay={10} left="6%" top="56%" />
        <FloatingIcon lib="fc" name="Sms" delay={11} left="90%" top="66%" />
        <FloatingIcon lib="fc" name="ConferenceCall" delay={12} left="40%" top="86%" />
        <FloatingIcon lib="fc" name="Like" delay={13} left="48%" top="4%" />
        <FloatingIcon lib="fc" name="Survey" delay={14} left="24%" top="12%" />
      </div>

      {children}
    </main>
  );
}