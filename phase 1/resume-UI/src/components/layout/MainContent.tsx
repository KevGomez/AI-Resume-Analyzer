import { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

const MainContent = ({ children }: MainContentProps) => {
  return (
    <main className="flex-grow flex items-center justify-center py-16">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-accent-500/20 to-primary-500/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        </div>

        {children}
      </div>
    </main>
  );
};

export default MainContent;
