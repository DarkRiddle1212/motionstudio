import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <Navigation />
      <main className="pt-16 lg:pt-20 flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;