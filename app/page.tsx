'use client';

import LandingLayout from './LandinLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { EditorShowcase } from '@/components/home/EditorShowcase';
import { LiveDemoSection } from '@/components/home/LiveDemoSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { PricingSection } from '@/components/home/PricingSection';
import { IntegrationSection } from '@/components/home/IntegrationSection';
import { FinalCTASection } from '@/components/home/FinalCTASection';
import { TopBannerPromotion } from '@/components/home/TopBannerPromotion';
import { ModalPromotion } from '@/components/home/ModalPromotion';
import { StickyPromoBar } from '@/components/home/StickyPromoBar';

export default function Home() {
  return (
    <>
      {/* Promotion Components */}
      <TopBannerPromotion />
      <ModalPromotion />
      <StickyPromoBar />

      <LandingLayout>
        <div className="bg-white">
          {/* Hero Section */}
          <HeroSection />

          {/* Features Section */}
          <FeaturesSection />

          {/* Editor Showcase - NEW Interactive Section */}
          <EditorShowcase />

          {/* Live Demo Section */}
          <LiveDemoSection />

          {/* Testimonials Section */}
          <TestimonialsSection />

          {/* Pricing Section - NEW */}
          <PricingSection />

          {/* Integration Section - NEW */}
          <IntegrationSection />

          {/* Final CTA Section - NEW */}
          <FinalCTASection />
        </div>
      </LandingLayout>
    </>
  );
}