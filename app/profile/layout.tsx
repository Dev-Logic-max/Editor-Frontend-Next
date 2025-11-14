'use client';

import { Header } from '@/components/layout/Header';
import { MotionDiv } from '@/components/common/MotionDiv';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="container mx-auto px-2 md:px-6 py-6">
        <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto">
          {children}
        </MotionDiv>
      </main>
    </>
  );
}