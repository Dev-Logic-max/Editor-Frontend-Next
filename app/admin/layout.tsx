'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/layout/Sidebar';
import { MotionDiv } from '@/components/common/MotionDiv';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 container mx-auto px-2 md:px-4 lg:px-6 py-4 md:py-6">
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {children}
          </MotionDiv>
        </main>
      </div>
      <Footer />
    </>
  );
}