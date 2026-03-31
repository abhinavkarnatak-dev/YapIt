import React from 'react';
import Link from 'next/link';

const AuthHeader = () => {
  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto bg-fuchsia-50/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(124,77,255,0.04)] antialiased tracking-tight">
      <div className="flex items-center gap-2">
        <Link href="/">
          <span className="text-2xl font-bold italic tracking-tighter text-violet-700 font-headline cursor-pointer">YapIt</span>
        </Link>
      </div>
    </header>
  );
};

export default AuthHeader;