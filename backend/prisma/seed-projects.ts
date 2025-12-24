import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleProjects = [
  {
    title: 'Brand Identity Animation',
    description: 'A comprehensive brand identity animation for a tech startup, featuring logo reveals, motion graphics, and animated brand guidelines.',
    goal: 'Create a memorable brand presence through motion design that captures the innovative spirit of the company.',
    solution: 'Developed a cohesive animation system with custom easing curves, particle effects, and seamless transitions that reflect the brand\'s modern aesthetic.',
    motionBreakdown: 'Logo reveal with particle dispersion, typography animations with kinetic text, color palette transitions, and icon animations.',
    toolsUsed: JSON.stringify(['After Effects', 'Cinema 4D', 'Illustrator']),
    thumbnailUrl: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop',
    caseStudyUrl: 'https://example.com/case-study-1',
    order: 1,
    isPublished: true,
  },
  {
    title: 'Product Launch Video',
    description: 'An engaging product launch video showcasing a new smartphone with dynamic 3D renders and sleek motion graphics.',
    goal: 'Generate excitement and clearly communicate product features through visually stunning motion design.',
    solution: 'Combined photorealistic 3D product renders with 2D motion graphics to create an immersive viewing experience.',
    motionBreakdown: '3D product rotation, feature callouts with animated lines, spec comparisons with data visualization, and cinematic transitions.',
    toolsUsed: JSON.stringify(['Blender', 'After Effects', 'Premiere Pro']),
    thumbnailUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop',
    caseStudyUrl: 'https://example.com/case-study-2',
    order: 2,
    isPublished: true,
  },
  {
    title: 'Social Media Campaign',
    description: 'A series of animated social media posts and stories for a fashion brand\'s seasonal collection launch.',
    goal: 'Drive engagement and brand awareness through eye-catching, scroll-stopping animations optimized for social platforms.',
    solution: 'Created a template system with modular animations that maintain brand consistency while allowing for content variation.',
    motionBreakdown: 'Text reveals, image transitions, sticker animations, countdown timers, and interactive story elements.',
    toolsUsed: JSON.stringify(['After Effects', 'Photoshop', 'Figma']),
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop',
    caseStudyUrl: 'https://example.com/case-study-3',
    order: 3,
    isPublished: true,
  },
  {
    title: 'Explainer Video Series',
    description: 'An educational explainer video series for a fintech company explaining complex financial concepts through animation.',
    goal: 'Simplify complex financial topics and make them accessible to a general audience through engaging visual storytelling.',
    solution: 'Developed a character-driven narrative with custom illustrations and smooth animations that guide viewers through each concept.',
    motionBreakdown: 'Character animations, infographic transitions, data visualizations, and scene transitions with parallax effects.',
    toolsUsed: JSON.stringify(['After Effects', 'Illustrator', 'Lottie']),
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    caseStudyUrl: 'https://example.com/case-study-4',
    order: 4,
    isPublished: true,
  },
];

async function main() {
  console.log('Seeding projects...');
  
  for (const project of sampleProjects) {
    const created = await prisma.project.create({
      data: project,
    });
    console.log(`Created project: ${created.title}`);
  }
  
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
