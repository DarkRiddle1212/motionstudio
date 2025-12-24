import { CheckIcon, AlertIcon, SearchIcon } from '../Common';

/**
 * Simple test component to verify Tailwind and icon system are working
 */
const TailwindTest = () => {
  return (
    <div className="p-8 space-y-6 bg-brand-primary-bg min-h-screen">
      <h1 className="text-display-md font-serif font-bold text-brand-primary-text">
        Tailwind & Icon System Test
      </h1>
      
      {/* Basic Tailwind Test */}
      <div className="bg-red-500 text-white p-4 rounded-lg">
        <h2 className="text-xl font-bold">Basic Tailwind Test</h2>
        <p>If you see red background and white text, basic Tailwind is working!</p>
      </div>
      
      {/* Custom Theme Test */}
      <div className="bg-brand-secondary-bg text-brand-primary-text p-4 rounded-lg border border-white/10">
        <h2 className="text-heading-lg font-serif">Custom Theme Test</h2>
        <p className="text-body-md text-brand-secondary-text">
          If you see dark background with custom brand colors, the theme is working!
        </p>
      </div>
      
      {/* Icon System Test */}
      <div className="bg-surface-card p-6 rounded-lg border border-white/10 space-y-4">
        <h2 className="text-heading-lg font-serif text-brand-primary-text">Icon System Test</h2>
        
        <div className="space-y-3">
          <div className="icon-text-left">
            <CheckIcon size="sm" className="text-green-500" />
            <span className="text-body-md text-brand-primary-text">Success icon with text</span>
          </div>
          
          <div className="icon-text-left">
            <AlertIcon size="sm" className="text-yellow-500" />
            <span className="text-body-md text-brand-primary-text">Warning icon with text</span>
          </div>
          
          <div className="icon-text-left">
            <SearchIcon size="sm" className="text-brand-accent" />
            <span className="text-body-md text-brand-primary-text">Search icon with text</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 pt-4">
          <CheckIcon size="xs" className="text-green-500" />
          <CheckIcon size="sm" className="text-green-500" />
          <CheckIcon size="md" className="text-green-500" />
          <CheckIcon size="lg" className="text-green-500" />
          <CheckIcon size="xl" className="text-green-500" />
        </div>
        <p className="text-caption text-brand-secondary-text">
          Icon sizes: xs, sm, md, lg, xl (should be progressively larger)
        </p>
      </div>
      
      {/* CSS Utilities Test */}
      <div className="bg-surface-elevated p-6 rounded-lg border border-white/10">
        <h2 className="text-heading-lg font-serif text-brand-primary-text mb-4">CSS Utilities Test</h2>
        
        <div className="space-y-3">
          <div className="social-icon bg-brand-accent text-white">
            <CheckIcon size="sm" />
          </div>
          
          <div className="btn-icon-left bg-brand-accent text-white px-4 py-2 rounded-lg">
            <SearchIcon size="sm" />
            <span>Button with icon</span>
          </div>
          
          <div className="glass p-4 rounded-lg">
            <p className="text-brand-primary-text">Glass morphism effect</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;