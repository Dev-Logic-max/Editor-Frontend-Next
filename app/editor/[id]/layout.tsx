'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/layout/Sidebar';
import { MotionDiv } from '@/components/common/MotionDiv';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex">
        <Sidebar />
        <main className="container mx-auto px-2 md:px-4 py-2 md:py-4">
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {children}
          </MotionDiv>
        </main>
      </div>
    </>
  );
}