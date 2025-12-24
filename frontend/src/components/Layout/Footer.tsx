import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SvgIcon } from '../Common/Icon';

/**
 * Premium Footer Component
 * 
 * Features:
 * - Sophisticated layout with proper spacing
 * - Hover effects on links
 * - Social media icons with animations
 * - Proper contrast on dark background
 * 
 * Requirements: 10.2
 */

interface FooterLinkProps {
  to: string;
  children: React.ReactNode;
  external?: boolean;
}

const FooterLink = ({ to, children, external }: FooterLinkProps) => {
  const linkClasses = "text-white/70 hover:text-brand-accent transition-colors duration-300 text-body-sm";
  
  if (external) {
    return (
      <a 
        href={to} 
        target="_blank" 
        rel="noopener noreferrer"
        className={linkClasses}
      >
        {children}
      </a>
    );
  }
  
  return (
    <Link to={to} className={linkClasses}>
      {children}
    </Link>
  );
};

interface SocialIconProps {
  href: string;
  label: string;
  children: React.ReactNode;
}

const SocialIcon = ({ href, label, children }: SocialIconProps) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-brand-accent hover:text-white transition-all duration-300"
    whileHover={{ scale: 1.1, y: -2 }}
    whileTap={{ scale: 0.95 }}
  >
    {children}
  </motion.a>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    studio: [
      { label: 'Portfolio', to: '/portfolio' },
      { label: 'About Us', to: '/about' },
      { label: 'Contact', to: '/contact' },
    ],
    education: [
      { label: 'All Courses', to: '/courses' },
      { label: 'Student Dashboard', to: '/dashboard' },
      { label: 'Become an Instructor', to: '/contact' },
    ],
    resources: [
      { label: 'Blog', to: '/blog', external: false },
      { label: 'Tutorials', to: '/tutorials', external: false },
      { label: 'FAQ', to: '/faq', external: false },
    ],
  };

  return (
    <footer 
      className="bg-brand-primary-text text-white relative overflow-hidden"
      data-testid="footer"
    >
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-accent/5 to-transparent pointer-events-none" 
        aria-hidden="true"
      />
      
      {/* Decorative accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-accent/30 to-transparent" />

      <div className="container-premium relative z-10 py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12 lg:mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <h3 className="text-2xl font-serif font-bold text-white">
                Motion Design
                <span className="block text-brand-accent">Studio</span>
              </h3>
            </Link>
            <p className="text-white/60 text-body-sm leading-relaxed mb-6 max-w-xs">
              Creating purposeful motion design that captivates audiences and elevates brands. 
              Learn from industry experts or hire us for your next project.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-3">
              <SocialIcon href="https://twitter.com" label="Follow us on Twitter">
                <SvgIcon size="sm" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </SvgIcon>
              </SocialIcon>
              <SocialIcon href="https://instagram.com" label="Follow us on Instagram">
                <SvgIcon size="sm" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </SvgIcon>
              </SocialIcon>
              <SocialIcon href="https://linkedin.com" label="Connect on LinkedIn">
                <SvgIcon size="sm" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </SvgIcon>
              </SocialIcon>
              <SocialIcon href="https://youtube.com" label="Subscribe on YouTube">
                <SvgIcon size="sm" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </SvgIcon>
              </SocialIcon>
            </div>
          </div>

          {/* Studio Links */}
          <div>
            <h4 className="text-white font-semibold text-heading-sm mb-6">Studio</h4>
            <ul className="space-y-4">
              {footerLinks.studio.map((link) => (
                <li key={link.to}>
                  <FooterLink to={link.to}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Education Links */}
          <div>
            <h4 className="text-white font-semibold text-heading-sm mb-6">Education</h4>
            <ul className="space-y-4">
              {footerLinks.education.map((link) => (
                <li key={link.to}>
                  <FooterLink to={link.to}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-white font-semibold text-heading-sm mb-6">Resources</h4>
            <ul className="space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.to}>
                  <FooterLink to={link.to} external={link.external}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-body-sm">
              © {currentYear} Motion Design Studio. All rights reserved.
            </p>
            <div className="flex gap-6">
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
