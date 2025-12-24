import { motion } from 'framer-motion';
import { Project } from '../../hooks/useProjects';
import { Card } from './';
import { Parallax } from '../Animation';
import { cardHoverVariants } from '../../utils/animationVariants';

interface ProjectCardProps {
  project: Project;
  onClick: (projectId: string) => void;
  className?: string;
  'data-testid'?: string;
}

const ProjectCard = ({ 
  project, 
  onClick, 
  className = '',
  'data-testid': testId 
}: ProjectCardProps) => {
  const handleClick = () => {
    onClick(project.id);
  };

  return (
    <motion.div
      variants={cardHoverVariants}
      initial="rest"
      whileHover="hover"
      className={`cursor-pointer group ${className}`}
      onClick={handleClick}
      data-testid={testId}
    >
      <Card variant="project" className="h-full overflow-hidden">
        {/* Project Image with Parallax */}
        <div className="relative aspect-video overflow-hidden group">
          <Parallax speed={0.3} className="w-full h-full">
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </Parallax>
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-brand-accent bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
        </div>

        {/* Project Content */}
        <div className="p-6">
          <h3 className="text-xl font-serif font-semibold text-brand-primary-text mb-3 line-clamp-2">
            {project.title}
          </h3>
          
          <p className="text-brand-secondary-text text-sm mb-4 line-clamp-3">
            {project.description}
          </p>

          {/* Tools Used */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.toolsUsed.slice(0, 3).map((tool, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-brand-primary-bg text-brand-primary-text rounded-full"
              >
                {tool}
              </span>
            ))}
            {project.toolsUsed.length > 3 && (
              <span className="px-2 py-1 text-xs bg-brand-secondary-text text-white rounded-full">
                +{project.toolsUsed.length - 3} more
              </span>
            )}
          </div>

          {/* View Case Study Link */}
          <div className="flex items-center text-brand-accent text-sm font-medium group-hover:text-brand-primary-text transition-colors duration-300">
            <span>View Case Study</span>
            <svg 
              className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;