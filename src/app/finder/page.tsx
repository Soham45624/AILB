import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FinderClient } from '@/components/finder/FinderClient';

export const metadata = {
  title: 'AILIB Finder — AI Tool Search & Discovery',
  description:
    'Find and compare the best AI tools based on your specific use case, pricing constraints, and feature requirements.',
};

export default function FinderPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-100 selection:text-zinc-950 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        <FinderClient />
      </main>

      <Footer />
    </div>
  );
}
