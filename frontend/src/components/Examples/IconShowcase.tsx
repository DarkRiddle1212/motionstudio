import { 
  Icon, 
  SvgIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CheckIcon,
  CloseIcon,
  AlertIcon,
  SearchIcon,
  PlayIcon,
  DownloadIcon,
  StarIcon,
  Button,
  Input
} from '../Common';

/**
 * Icon Showcase Component
 * 
 * Demonstrates the standardized icon system with proper sizing and alignment.
 * This component shows the before/after comparison and various usage patterns.
 */
const IconShowcase = () => {
  return (
    <div className="container-premium py-16 space-y-12">
      <div className="text-center">
        <h1 className="text-display-md font-serif font-bold text-brand-primary-text mb-4">
          Icon System Showcase
        </h1>
        <p className="text-body-lg text-brand-secondary-text max-w-2xl mx-auto">
          Standardized icon sizing and alignment system for consistent UI components.
        </p>
      </div>

      {/* Icon Sizes */}
      <section className="space-y-6">
        <h2 className="text-heading-lg font-serif font-semibold text-brand-primary-text">
          Icon Sizes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="text-center p-6 bg-surface-card rounded-lg border border-white/10">
            <CheckIcon size="xs" className="mx-auto mb-3 text-brand-accent" />
            <p className="text-body-sm text-brand-primary-text font-medium">Extra Small</p>
            <p className="text-caption text-brand-secondary-text">12px (0.75rem)</p>
          </div>
          <div className="text-center p-6 bg-surface-card rounded-lg border border-white/10">
            <CheckIcon size="sm" className="mx-auto mb-3 text-brand-accent" />
            <p className="text-body-sm text-brand-primary-text font-medium">Small</p>
            <p className="text-caption text-brand-secondary-text">16px (1rem)</p>
          </div>
          <div className="text-center p-6 bg-surface-card rounded-lg border border-white/10">
            <CheckIcon size="md" className="mx-auto mb-3 text-brand-accent" />
            <p className="text-body-sm text-brand-primary-text font-medium">Medium</p>
            <p className="text-caption text-brand-secondary-text">20px (1.25rem)</p>
          </div>
          <div className="text-center p-6 bg-surface-card rounded-lg border border-white/10">
            <CheckIcon size="lg" className="mx-auto mb-3 text-brand-accent" />
            <p className="text-body-sm text-brand-primary-text font-medium">Large</p>
            <p className="text-caption text-brand-secondary-text">24px (1.5rem)</p>
          </div>
          <div className="text-center p-6 bg-surface-card rounded-lg border border-white/10">
            <CheckIcon size="xl" className="mx-auto mb-3 text-brand-accent" />
            <p className="text-body-sm text-brand-primary-text font-medium">Extra Large</p>
            <p className="text-caption text-brand-secondary-text">32px (2rem)</p>
          </div>
        </div>
      </section>

      {/* Icon Alignment Examples */}
      <section className="space-y-6">
        <h2 className="text-heading-lg font-serif font-semibold text-brand-primary-text">
          Proper Alignment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Before */}
          <div className="space-y-4">
            <h3 className="text-heading-md font-serif font-medium text-red-400">
              ❌ Before (Misaligned)
            </h3>
            <div className="p-6 bg-surface-card rounded-lg border border-red-500/20">
              <div className="space-y-4">
                {/* Inconsistent sizes */}
                <div className="flex items-center gap-3">
                  <svg className="w-3 h-3 text-brand-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-body-md">Small icon (12px)</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-7 h-7 text-brand-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-body-md">Large icon (28px)</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-brand-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-body-md">Medium icon (20px)</span>
                </div>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="space-y-4">
            <h3 className="text-heading-md font-serif font-medium text-green-400">
              ✅ After (Aligned)
            </h3>
            <div className="p-6 bg-surface-card rounded-lg border border-green-500/20">
              <div className="space-y-4">
                {/* Consistent sizes */}
                <div className="icon-text-left">
                  <CheckIcon size="sm" className="text-brand-accent" />
                  <span className="text-body-md">Consistent small icon</span>
                </div>
                <div className="icon-text-left">
                  <CheckIcon size="sm" className="text-brand-accent" />
                  <span className="text-body-md">Consistent small icon</span>
                </div>
                <div className="icon-text-left">
                  <CheckIcon size="sm" className="text-brand-accent" />
                  <span className="text-body-md">Consistent small icon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="space-y-6">
        <h2 className="text-heading-lg font-serif font-semibold text-brand-primary-text">
          Usage Examples
        </h2>
        
        {/* Buttons */}
        <div className="space-y-4">
          <h3 className="text-heading-md font-serif font-medium text-brand-primary-text">
            Buttons
          </h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" className="btn-icon-left">
              <PlayIcon size="sm" />
              Play Video
            </Button>
            <Button variant="secondary" className="btn-icon-right">
              Download
              <DownloadIcon size="sm" />
            </Button>
            <Button variant="ghost" className="btn-icon-only" aria-label="Close">
              <CloseIcon size="sm" />
            </Button>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <h3 className="text-heading-md font-serif font-medium text-brand-primary-text">
            Form Elements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <Input 
              placeholder="Search..." 
              leftIcon={<SearchIcon size="sm" />}
            />
            <Input 
              placeholder="Verified input" 
              rightIcon={<CheckIcon size="sm" className="text-green-500" />}
              success
            />
          </div>
        </div>

        {/* Status Indicators */}
        <div className="space-y-4">
          <h3 className="text-heading-md font-serif font-medium text-brand-primary-text">
            Status Indicators
          </h3>
          <div className="space-y-3">
            <div className="icon-text-left">
              <CheckIcon size="xs" className="icon-success" />
              <span className="text-body-sm">Task completed successfully</span>
            </div>
            <div className="icon-text-left">
              <AlertIcon size="xs" className="icon-warning" />
              <span className="text-body-sm">Warning: Please review your input</span>
            </div>
            <div className="icon-text-left">
              <CloseIcon size="xs" className="icon-error" />
              <span className="text-body-sm">Error: Something went wrong</span>
            </div>
          </div>
        </div>

        {/* Star Rating */}
        <div className="space-y-4">
          <h3 className="text-heading-md font-serif font-medium text-brand-primary-text">
            Star Rating
          </h3>
          <div className="flex items-center gap-1">
            <StarIcon size="sm" filled className="text-yellow-400" />
            <StarIcon size="sm" filled className="text-yellow-400" />
            <StarIcon size="sm" filled className="text-yellow-400" />
            <StarIcon size="sm" filled className="text-yellow-400" />
            <StarIcon size="sm" className="text-brand-secondary-text" />
            <span className="ml-2 text-body-sm text-brand-secondary-text">4.0 out of 5</span>
          </div>
        </div>
      </section>

      {/* Available Icons */}
      <section className="space-y-6">
        <h2 className="text-heading-lg font-serif font-semibold text-brand-primary-text">
          Available Icons
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { icon: ChevronRightIcon, name: 'ChevronRight' },
            { icon: ChevronDownIcon, name: 'ChevronDown' },
            { icon: CheckIcon, name: 'Check' },
            { icon: CloseIcon, name: 'Close' },
            { icon: AlertIcon, name: 'Alert' },
            { icon: SearchIcon, name: 'Search' },
            { icon: PlayIcon, name: 'Play' },
            { icon: DownloadIcon, name: 'Download' },
            { icon: StarIcon, name: 'Star' },
          ].map(({ icon: IconComponent, name }) => (
            <div key={name} className="text-center p-4 bg-surface-card rounded-lg border border-white/10">
              <IconComponent size="lg" className="mx-auto mb-2 text-brand-accent" />
              <p className="text-caption text-brand-secondary-text">{name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default IconShowcase;