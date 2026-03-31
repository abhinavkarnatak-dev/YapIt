import React from 'react';
import Link from 'next/link';

const AuthFooter = () => {
  return (
    <footer className="w-full py-8 bg-transparent">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-8 w-full max-w-screen-2xl mx-auto">
        <div className="text-sm text-slate-500">
          © {new Date().getFullYear()} YapIt. Secure messaging.
        </div>
        <div className="flex gap-6">
          <Link className="text-sm text-slate-500 hover:text-violet-600 transition-colors cursor-pointer" href="/privacy">Privacy</Link>
          <Link className="text-sm text-slate-500 hover:text-violet-600 transition-colors cursor-pointer" href="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
};

export default AuthFooter;