import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FadeIn, SlideUp } from '../Animation';
import { Button, Card, Input, Textarea, ProgressBar, Badge, Modal } from '../Common';

const ComponentDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progress] = useState(65);

  return (
    <div className="min-h-screen bg-brand-primary-bg p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <FadeIn delay={0.2}>
          <div className="text-center">
            <h1 className="text-4xl font-serif text-brand-primary-text mb-4">
              Motion Design Studio
            </h1>
            <p className="text-brand-secondary-text mb-8">
              Component Library Demo
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/login">
                <Button variant="primary">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="secondary">Sign Up</Button>
              </Link>
            </div>
          </div>
        </FadeIn>

        <SlideUp delay={0.4}>
          <Card variant="elevated" className="p-6">
            <h2 className="text-2xl font-serif text-brand-primary-text mb-4">Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="tertiary">Tertiary Button</Button>
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="primary" isLoading>Loading</Button>
            </div>
          </Card>
        </SlideUp>

        <SlideUp delay={0.6}>
          <Card variant="elevated" className="p-6">
            <h2 className="text-2xl font-serif text-brand-primary-text mb-4">Form Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="Enter your email"
                fullWidth
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="Enter password"
                fullWidth
              />
              <div className="md:col-span-2">
                <Textarea 
                  label="Message" 
                  placeholder="Enter your message here..."
                  fullWidth
                />
              </div>
            </div>
          </Card>
        </SlideUp>

        <SlideUp delay={0.8}>
          <Card variant="elevated" className="p-6">
            <h2 className="text-2xl font-serif text-brand-primary-text mb-4">Progress & Status</h2>
            <div className="space-y-6">
              <ProgressBar 
                value={progress} 
                label="Course Progress"
              />
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="success">Completed</Badge>
                <Badge variant="warning">In Progress</Badge>
                <Badge variant="error">Failed</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>
          </Card>
        </SlideUp>

        <SlideUp delay={1.0}>
          <Card variant="elevated" className="p-6">
            <h2 className="text-2xl font-serif text-brand-primary-text mb-4">Interactive Components</h2>
            <div className="space-y-4">
              <Button 
                variant="primary" 
                onClick={() => setIsModalOpen(true)}
              >
                Open Modal
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="project" hoverable className="p-4">
                  <h3 className="font-serif text-lg text-brand-primary-text mb-2">Project Card</h3>
                  <p className="text-brand-secondary-text text-sm">Hover to see animation</p>
                </Card>
                <Card variant="course" hoverable className="p-4">
                  <h3 className="font-serif text-lg text-brand-primary-text mb-2">Course Card</h3>
                  <p className="text-brand-secondary-text text-sm">Interactive card example</p>
                </Card>
                <Card variant="default" className="p-4">
                  <h3 className="font-serif text-lg text-brand-primary-text mb-2">Static Card</h3>
                  <p className="text-brand-secondary-text text-sm">No hover effects</p>
                </Card>
              </div>
            </div>
          </Card>
        </SlideUp>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Component Demo Modal"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="tertiary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
          </div>
        }
      >
        <p className="text-brand-secondary-text">
          This is a demo modal showcasing the modal component with proper animations,
          overlay handling, and accessibility features like escape key support.
        </p>
      </Modal>
    </div>
  );
};

export default ComponentDemo;