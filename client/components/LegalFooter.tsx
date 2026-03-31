import React from 'react';

const LegalFooter = () => {
  return (
    <footer className="w-full py-8 border-t border-surface-container-high mt-12 bg-surface-container-lowest">
      <div className="flex justify-center flex-col items-center gap-2 max-w-4xl mx-auto px-6 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} YapIt. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default LegalFooter;