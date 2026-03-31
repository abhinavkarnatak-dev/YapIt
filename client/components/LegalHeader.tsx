import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const LegalHeader = () => {
  return (
    <header className="sticky top-0 z-50 px-6 py-4 bg-fuchsia-50/70 backdrop-blur-2xl shadow-sm border-b border-surface-container-highest/30">
      <div className="flex items-center gap-4 max-w-4xl mx-auto">
        <Link href="/signup" className="text-on-surface hover:bg-surface-container-highest p-2 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
        </Link>
        <span className="text-xl font-bold italic tracking-tighter text-violet-700 font-headline">YapIt</span>
      </div>
    </header>
  );
};

export default LegalHeader;