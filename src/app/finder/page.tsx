import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FinderClient } from '@/components/finder/FinderClient';

export const metadata = {
  title: 'AI Finder — Intelligent Tool Discovery',
  description:
    'Find and compare the best AI tools based on your specific use case, pricing constraints, and feature requirements.',
};

export default function FinderPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#141613] selection:bg-[#ECE8DF] selection:text-[#141613] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 pb-24 md:pb-12 flex-1 w-full">
        <FinderClient />
      </main>

      <Footer />
    </div>
  );
}
