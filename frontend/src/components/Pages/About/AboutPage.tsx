import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FadeIn, SlideUp } from '../../Animation';
import { Layout } from '../../Layout';
import { Button } from '../../Common';
import { staggerContainerVariants, slideUpVariants } from '../../../utils/animationVariants';

const AboutPage = () => {
  const navigate = useNavigate();
  // Tools used by the studio
  const tools = [
    'Adobe After Effects',
    'Cinema 4D',
    'Blender',
    'Adobe Premiere Pro',
    'Adobe Illustrator',
    'Figma',
    'DaVinci Resolve',
    'Houdini'
  ];

  // Optional team members section (can be populated later)
  const teamMembers: Array<{
    id: string;
    name: string;
    role: string;
    bio: string;
    imageUrl?: string;
  }> = [
    // Example structure:
    // {
    //   id: '1',
    //   name: 'Jane Doe',
    //   role: 'Lead Motion Designer',
    //   bio: 'Jane has over 10 years of experience...',
    //   imageUrl: '/team/jane.jpg'
    // }
  ];

  return (
    <Layout className="bg-brand-primary-bg">
      {/* Hero Section */}
      <section className="relative bg-gradient-premium-subtle section-spacing">
        <div className="container-premium">
          <FadeIn>
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-brand-primary-text mb-4 sm:mb-6 leading-tight">
                About Our Studio
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-brand-secondary-text max-w-3xl mx-auto leading-relaxed px-4">
                Crafting purposeful motion design and empowering the next generation of motion designers
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Studio Story Section */}
      <section className="section-spacing">
        <div className="container-narrow">
          <FadeIn>
            <div className="mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-brand-primary-text mb-4 sm:mb-6">
                Our Story
              </h2>
              <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-brand-secondary-text leading-relaxed">
                <p>
                  Motion Design Studio was founded with a singular vision: to create motion design 
                  that doesn't just move, but moves with purpose. We believe that every frame, 
                  every transition, and every animation should serve a clear intention—whether 
                  it's guiding a user's attention, telling a compelling story, or bringing a 
                  brand's personality to life.
                </p>
                <p>
                  What started as a passion project has grown into a full-service motion design 
                  studio and learning platform. We've had the privilege of working with brands 
                  across industries, helping them communicate their message through elegant, 
                  purposeful animation. Along the way, we discovered another passion: teaching 
                  others to master this craft.
                </p>
                <p>
                  Today, we serve two communities: clients who need professional motion design 
                  services, and students who want to learn the art and science of motion design. 
                  Both are united by our commitment to quality, clarity, and purposeful design.
                </p>
              </div>
            </div>
          </FadeIn>

          <SlideUp delay={0.2}>
            <div className="mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-brand-primary-text mb-4 sm:mb-6">
                Our Mission
              </h2>
              <div className="card-modern p-6 sm:p-8 md:p-12">
                <p className="text-lg sm:text-xl text-brand-primary-text leading-relaxed">
                  To elevate brands through purposeful motion design and empower aspiring 
                  designers with the skills, knowledge, and confidence to create work that 
                  matters. We believe in motion that serves a purpose, design that tells a 
                  story, and education that transforms careers.
                </p>
              </div>
            </div>
          </SlideUp>

          <SlideUp delay={0.3}>
            <div className="mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-brand-primary-text mb-4 sm:mb-6">
                Our Vision
              </h2>
              <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-brand-secondary-text leading-relaxed">
                <p>
                  We envision a world where motion design is recognized not just as decoration, 
                  but as a powerful communication tool that enhances user experiences, clarifies 
                  complex ideas, and creates emotional connections. We're building a community 
                  of thoughtful motion designers who understand that great animation is about 
                  restraint, timing, and purpose—not just flashy effects.
                </p>
                <p>
                  Through our work and our courses, we aim to raise the standard of motion 
                  design across the industry, one project and one student at a time.
                </p>
              </div>
            </div>
          </SlideUp>
        </div>
      </section>

      {/* Tools Section */}
      <section className="section-spacing bg-brand-secondary-bg">
        <div className="container-premium">
          <FadeIn>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-brand-primary-text mb-3 sm:mb-4">
                Tools We Use
              </h2>
              <p className="text-base sm:text-lg text-brand-secondary-text max-w-2xl mx-auto px-4">
                We leverage industry-leading tools to bring our creative visions to life
              </p>
            </div>
          </FadeIn>

          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {tools.map((tool, index) => (
              <motion.div
                key={index}
                variants={slideUpVariants}
                className="card-modern p-6 text-center"
                data-testid={`tool-${index}`}
              >
                <p className="text-brand-primary-text font-medium text-sm sm:text-base">
                  {tool}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section (Optional - only shown if team members exist) */}
      {teamMembers.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-brand-primary-text mb-3 sm:mb-4">
                  Meet Our Team
                </h2>
                <p className="text-base sm:text-lg text-brand-secondary-text max-w-2xl mx-auto px-4">
                  The talented individuals behind our work
                </p>
              </div>
            </FadeIn>

            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              {teamMembers.map((member) => (
                <motion.div
                  key={member.id}
                  variants={slideUpVariants}
                  className="bg-brand-secondary-bg rounded-2xl overflow-hidden"
                  data-testid={`team-member-${member.id}`}
                >
                  {member.imageUrl && (
                    <div className="aspect-square bg-brand-primary-bg">
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-brand-primary-text mb-2">
                      {member.name}
                    </h3>
                    <p className="text-brand-accent font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                      {member.role}
                    </p>
                    <p className="text-brand-secondary-text leading-relaxed text-sm sm:text-base">
                      {member.bio}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section-spacing bg-brand-secondary-bg">
        <div className="container-narrow text-center">
          <FadeIn>
            <div className="card-modern p-8 sm:p-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-brand-primary-text mb-4 sm:mb-6">
                Let's Work Together
              </h2>
              <p className="text-base sm:text-lg text-brand-secondary-text mb-6 sm:mb-8 max-w-2xl mx-auto">
                Whether you need motion design services or want to learn from us, 
                we'd love to hear from you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/contact')}
                  className="w-full sm:w-auto"
                  data-testid="contact-cta"
                >
                  Get in Touch
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/courses')}
                  className="w-full sm:w-auto"
                  data-testid="courses-cta"
                >
                  Browse Courses
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
