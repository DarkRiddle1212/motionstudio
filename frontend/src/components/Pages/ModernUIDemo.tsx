import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../Layout';
import { Button } from '../Common';

/**
 * Modern UI Demo Page
 * Showcases the new professional color scheme and modern components
 */
const ModernUIDemo: React.FC = () => {
  const [progress, setProgress] = useState(65);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <Layout className="bg-brand-primary-bg">
      <div className="section-spacing">
        <div className="container-premium">
          {/* Header Section */}
          <div className="section-header-modern">
            <h1 className="text-display-lg font-serif font-bold mb-4">
              Modern UI Components
            </h1>
            <p className="text-body-lg text-brand-secondary-text max-w-2xl mx-auto">
              Experience our new professional design system with modern colors, 
              smooth animations, and premium interactions.
            </p>
          </div>

          {/* Color Palette Section */}
          <section className="mb-16">
            <h2 className="text-heading-lg font-serif font-semibold text-brand-primary-text mb-8 text-center">
              Professional Color Palette
            </h2>
            <div className="grid-modern-auto">
              <div className="card-modern p-6">
                <h3 className="text-heading-md font-serif font-semibold text-brand-primary-text mb-4">
                  Primary Colors
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-brand-primary-bg border border-white/10"></div>
                    <div>
                      <p className="text-sm font-medium text-brand-primary-text">Deep Navy</p>
                      <p className="text-xs text-brand-muted-text">#0F0F23</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-brand-secondary-bg border border-white/10"></div>
                    <div>
                      <p className="text-sm font-medium text-brand-primary-text">Dark Navy</p>
                      <p className="text-xs text-brand-muted-text">#1A1A2E</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-brand-tertiary-bg border border-white/10"></div>
                    <div>
                      <p className="text-sm font-medium text-brand-primary-text">Medium Navy</p>
                      <p className="text-xs text-brand-muted-text">#16213E</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-modern p-6">
                <h3 className="text-heading-md font-serif font-semibold text-brand-primary-text mb-4">
                  Accent Colors
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-brand-accent shadow-glow"></div>
                    <div>
                      <p className="text-sm font-medium text-brand-primary-text">Modern Indigo</p>
                      <p className="text-xs text-brand-muted-text">#6366F1</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-brand-accent-light"></div>
                    <div>
                      <p className="text-sm font-medium text-brand-primary-text">Light Indigo</p>
                      <p className="text-xs text-brand-muted-text">#818CF8</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-brand-success"></div>
                    <div>
                      <p className="text-sm font-medium text-brand-primary-text">Success Green</p>
                      <p className="text-xs text-brand-muted-text">#10B981</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Button Components */}
          <section className="mb-16">
            <h2 className="text-heading-lg font-serif font-semibold text-brand-primary-text mb-8 text-center">
              Modern Button Components
            </h2>
            <div className="grid-modern-3">
              <div className="card-modern p-6 text-center">
                <h3 className="text-heading-sm font-serif font-semibold text-brand-primary-text mb-4">
                  Primary Buttons
                </h3>
                <div className="space-y-4">
                  <Button variant="primary" size="sm">Small Primary</Button>
                  <Button variant="primary" size="md">Medium Primary</Button>
                  <Button variant="primary" size="lg">Large Primary</Button>
                  <Button 
                    variant="primary" 
                    size="md" 
                    isLoading={isLoading}
                    onClick={handleLoadingDemo}
                  >
                    {isLoading ? 'Loading...' : 'Click Me'}
                  </Button>
                </div>
              </div>

              <div className="card-modern p-6 text-center">
                <h3 className="text-heading-sm font-serif font-semibold text-brand-primary-text mb-4">
                  Secondary Buttons
                </h3>
                <div className="space-y-4">
                  <Button variant="secondary" size="sm">Small Secondary</Button>
                  <Button variant="secondary" size="md">Medium Secondary</Button>
                  <Button variant="secondary" size="lg">Large Secondary</Button>
                  <Button variant="secondary" size="md" disabled>Disabled</Button>
                </div>
              </div>

              <div className="card-modern p-6 text-center">
                <h3 className="text-heading-sm font-serif font-semibold text-brand-primary-text mb-4">
                  Other Variants
                </h3>
                <div className="space-y-4">
                  <Button variant="tertiary" size="md">Tertiary Button</Button>
                  <Button variant="ghost" size="md">Ghost Button</Button>
                  <Button variant="primary" size="md" fullWidth>Full Width</Button>
                </div>
              </div>
            </div>
          </section>

          {/* Modern UI Elements */}
          <section className="mb-16">
            <h2 className="text-heading-lg font-serif font-semibold text-brand-primary-text mb-8 text-center">
              Modern UI Elements
            </h2>
            <div className="grid-modern-auto">
              <div className="card-modern p-6">
                <h3 className="text-heading-sm font-serif font-semibold text-brand-primary-text mb-4">
                  Form Elements
                </h3>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Modern input field"
                    className="input-modern w-full"
                  />
                  <textarea 
                    placeholder="Modern textarea"
                    className="input-modern w-full h-24 resize-none"
                  />
                  <select className="input-modern w-full">
                    <option>Select an option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                </div>
              </div>

              <div className="card-modern p-6">
                <h3 className="text-heading-sm font-serif font-semibold text-brand-primary-text mb-4">
                  Progress & Loading
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm text-brand-secondary-text mb-2">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="progress-modern">
                      <div 
                        className="progress-modern-bar" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="spinner-modern"></div>
                    <span className="text-sm text-brand-secondary-text">Loading...</span>
                  </div>
                </div>
              </div>

              <div className="card-modern p-6">
                <h3 className="text-heading-sm font-serif font-semibold text-brand-primary-text mb-4">
                  Badges & Tags
                </h3>
                <div className="flex flex-wrap gap-3">
                  <span className="badge-modern badge-accent">New</span>
                  <span className="badge-modern badge-success">Active</span>
                  <span className="badge-modern" style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#F59E0B',
                    border: '1px solid rgba(245, 158, 11, 0.2)'
                  }}>
                    Warning
                  </span>
                  <span className="badge-modern" style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}>
                    Error
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Glass Morphism Examples */}
          <section className="mb-16">
            <h2 className="text-heading-lg font-serif font-semibold text-brand-primary-text mb-8 text-center">
              Glass Morphism Effects
            </h2>
            <div className="grid-modern-3">
              <motion.div 
                className="glass p-6 rounded-xl hover-glow-modern"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-heading-sm font-serif font-semibold text-brand-primary-text mb-3">
                  Standard Glass
                </h3>
                <p className="text-sm text-brand-secondary-text">
                  Subtle glass effect with backdrop blur and transparency.
                </p>
              </motion.div>

              <motion.div 
                className="glass-light p-6 rounded-xl hover-glow-modern"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-heading-sm font-serif font-semibold text-brand-primary-text mb-3">
                  Light Glass
                </h3>
                <p className="text-sm text-brand-secondary-text">
                  Lighter variant with more transparency.
                </p>
              </motion.div>

              <motion.div 
                className="glass-accent p-6 rounded-xl hover-glow-modern"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-heading-sm font-serif font-semibold text-brand-primary-text mb-3">
                  Accent Glass
                </h3>
                <p className="text-sm text-brand-secondary-text">
                  Glass effect with accent color tinting.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Typography Showcase */}
          <section className="mb-16">
            <h2 className="text-heading-lg font-serif font-semibold text-brand-primary-text mb-8 text-center">
              Typography System
            </h2>
            <div className="card-modern p-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-display-lg font-serif font-bold text-brand-primary-text mb-2">
                    Display Large - Playfair Display
                  </h1>
                  <p className="text-xs text-brand-muted-text">48px / 1.2 line height / -0.02em letter spacing</p>
                </div>
                
                <div>
                  <h2 className="text-display-md font-serif font-bold text-brand-primary-text mb-2">
                    Display Medium - Playfair Display
                  </h2>
                  <p className="text-xs text-brand-muted-text">36px / 1.2 line height / -0.01em letter spacing</p>
                </div>
                
                <div>
                  <h3 className="text-heading-lg font-serif font-semibold text-brand-primary-text mb-2">
                    Heading Large - Playfair Display
                  </h3>
                  <p className="text-xs text-brand-muted-text">24px / 1.4 line height / 0 letter spacing</p>
                </div>
                
                <div>
                  <p className="text-body-lg text-brand-secondary-text mb-2">
                    Body Large - Inter Regular - This is the main body text used for longer content and descriptions.
                  </p>
                  <p className="text-xs text-brand-muted-text">18px / 1.7 line height / 0 letter spacing</p>
                </div>
                
                <div>
                  <p className="text-body-md text-brand-secondary-text mb-2">
                    Body Medium - Inter Regular - Standard body text for most content.
                  </p>
                  <p className="text-xs text-brand-muted-text">16px / 1.7 line height / 0 letter spacing</p>
                </div>
                
                <div>
                  <p className="text-premium-caption text-brand-accent uppercase tracking-widest mb-2">
                    Caption Text - Inter Medium
                  </p>
                  <p className="text-xs text-brand-muted-text">12px / 1.5 line height / 0.01em letter spacing</p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="card-modern p-8 bg-gradient-accent-soft">
              <h2 className="text-display-md font-serif font-bold text-brand-primary-text mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-body-lg text-brand-secondary-text mb-8 max-w-2xl mx-auto">
                Experience the power of modern design with our professional UI components 
                and carefully crafted color palette.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" size="lg">
                  Start Your Project
                </Button>
                <Button variant="secondary" size="lg">
                  View Documentation
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default ModernUIDemo;