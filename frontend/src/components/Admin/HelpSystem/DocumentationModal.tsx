import React, { useState } from 'react';
import { Modal } from '../../Common';

interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  subsections?: DocumentationSection[];
}

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
}

const documentationSections: DocumentationSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: `
      <h3>Welcome to Motion Studio Admin Panel</h3>
      <p>The admin panel provides comprehensive tools for managing your Motion Design Studio platform. This guide will help you navigate and use all available features effectively.</p>
      
      <h4>First Steps</h4>
      <ol>
        <li>Familiarize yourself with the navigation menu on the left</li>
        <li>Review the dashboard for an overview of platform metrics</li>
        <li>Set up your notification preferences in System Settings</li>
        <li>Review security settings and audit logs</li>
      </ol>
    `,
  },
  {
    id: 'user-management',
    title: 'User Management',
    content: `
      <h3>Managing Platform Users</h3>
      <p>The User Management section allows you to oversee all platform users including students, instructors, and administrators.</p>
      
      <h4>Key Features</h4>
      <ul>
        <li><strong>User Search:</strong> Find users by email, name, or role</li>
        <li><strong>User Details:</strong> View enrollment history, payment records, and activity logs</li>
        <li><strong>Role Management:</strong> Change user roles and permissions</li>
        <li><strong>Account Status:</strong> Suspend or activate user accounts</li>
        <li><strong>Instructor Creation:</strong> Add new instructors with automatic credential generation</li>
      </ul>
      
      <h4>Common Tasks</h4>
      <p><strong>Creating a New Instructor:</strong></p>
      <ol>
        <li>Navigate to User Management</li>
        <li>Click "Add New User" button</li>
        <li>Select "Instructor" role</li>
        <li>Fill in required information</li>
        <li>System will automatically send login credentials via email</li>
      </ol>
      
      <p><strong>Suspending a User Account:</strong></p>
      <ol>
        <li>Search for the user</li>
        <li>Click on their name to view details</li>
        <li>Click "Suspend Account" button</li>
        <li>Confirm the action</li>
        <li>User will be notified via email</li>
      </ol>
    `,
  },
  {
    id: 'course-management',
    title: 'Course Management',
    content: `
      <h3>Managing Courses and Content</h3>
      <p>Oversee all courses on the platform, manage publication status, and moderate content.</p>
      
      <h4>Course Overview</h4>
      <ul>
        <li><strong>Course List:</strong> View all courses with instructor, enrollment count, and status</li>
        <li><strong>Publication Control:</strong> Publish or unpublish courses</li>
        <li><strong>Content Moderation:</strong> Review and approve course content</li>
        <li><strong>Bulk Operations:</strong> Perform actions on multiple courses simultaneously</li>
      </ul>
      
      <h4>Publishing a Course</h4>
      <ol>
        <li>Navigate to Course Management</li>
        <li>Find the course in the list</li>
        <li>Click the status toggle or "Publish" button</li>
        <li>Course becomes immediately visible to students</li>
        <li>Instructor and enrolled students are notified</li>
      </ol>
      
      <h4>Content Moderation</h4>
      <p>When content is flagged for review:</p>
      <ol>
        <li>Navigate to the "Flagged Content" tab</li>
        <li>Review the content and context</li>
        <li>Choose to approve, reject, or request modifications</li>
        <li>Add moderation notes for the instructor</li>
      </ol>
    `,
  },
  {
    id: 'financial-management',
    title: 'Financial Management',
    content: `
      <h3>Payment and Revenue Management</h3>
      <p>Monitor financial performance, process refunds, and manage payment-related issues.</p>
      
      <h4>Financial Dashboard</h4>
      <ul>
        <li><strong>Revenue Metrics:</strong> Track total and monthly revenue</li>
        <li><strong>Transaction Overview:</strong> Monitor payment success rates</li>
        <li><strong>Refund Management:</strong> Process refunds and track refund rates</li>
        <li><strong>Payment Search:</strong> Find specific transactions</li>
      </ul>
      
      <h4>Processing a Refund</h4>
      <ol>
        <li>Navigate to Financial Dashboard</li>
        <li>Search for the transaction</li>
        <li>Click on the transaction to view details</li>
        <li>Click "Process Refund" button</li>
        <li>Confirm the refund amount</li>
        <li>System automatically updates user access</li>
      </ol>
      
      <h4>Generating Financial Reports</h4>
      <ol>
        <li>Go to the Reports section</li>
        <li>Select date range and metrics</li>
        <li>Choose export format (CSV or PDF)</li>
        <li>Click "Generate Report"</li>
        <li>Download will start automatically</li>
      </ol>
    `,
  },
  {
    id: 'scholarships',
    title: 'Scholarship Management',
    content: `
      <h3>Managing Scholarships and Free Access</h3>
      <p>Grant scholarships, manage free course access, and track scholarship recipients.</p>
      
      <h4>Granting a Scholarship</h4>
      <ol>
        <li>Navigate to Scholarship Management</li>
        <li>Click "Grant New Scholarship"</li>
        <li>Select the student and course</li>
        <li>Set discount percentage (100% for full scholarship)</li>
        <li>Add reason and expiration date</li>
        <li>Student receives immediate access and email notification</li>
      </ol>
      
      <h4>Manual Enrollment</h4>
      <p>For special cases where you need to enroll a student without payment:</p>
      <ol>
        <li>Go to User Management</li>
        <li>Find the student</li>
        <li>Click "Manual Enrollment"</li>
        <li>Select the course</li>
        <li>Add enrollment reason</li>
        <li>Student gets immediate access</li>
      </ol>
    `,
  },
  {
    id: 'analytics',
    title: 'Analytics and Reporting',
    content: `
      <h3>Platform Analytics</h3>
      <p>Monitor platform performance, user engagement, and system health.</p>
      
      <h4>Key Metrics</h4>
      <ul>
        <li><strong>User Engagement:</strong> Login frequency, session duration</li>
        <li><strong>Course Performance:</strong> Completion rates, ratings</li>
        <li><strong>System Health:</strong> Server performance, error rates</li>
        <li><strong>Revenue Trends:</strong> Financial performance over time</li>
      </ul>
      
      <h4>Custom Reports</h4>
      <p>Create custom analytics reports:</p>
      <ol>
        <li>Navigate to Analytics Dashboard</li>
        <li>Click "Custom Report"</li>
        <li>Select metrics and time range</li>
        <li>Choose visualization type</li>
        <li>Export or save for future use</li>
      </ol>
    `,
  },
  {
    id: 'system-settings',
    title: 'System Configuration',
    content: `
      <h3>Platform Configuration</h3>
      <p>Configure platform settings, email templates, and feature toggles.</p>
      
      <h4>Email Templates</h4>
      <p>Customize automated emails:</p>
      <ol>
        <li>Navigate to System Settings</li>
        <li>Click "Email Templates"</li>
        <li>Select template to edit</li>
        <li>Use rich text editor with variable placeholders</li>
        <li>Preview before saving</li>
      </ol>
      
      <h4>Feature Toggles</h4>
      <p>Enable or disable platform features:</p>
      <ul>
        <li>Toggle features on/off instantly</li>
        <li>Changes apply immediately across the platform</li>
        <li>Users are notified of feature changes</li>
        <li>All changes are logged for audit purposes</li>
      </ul>
    `,
  },
  {
    id: 'security',
    title: 'Security and Audit',
    content: `
      <h3>Security Monitoring</h3>
      <p>Monitor security events, review audit logs, and manage user sessions.</p>
      
      <h4>Security Dashboard</h4>
      <ul>
        <li><strong>Login Monitoring:</strong> Track login attempts and failures</li>
        <li><strong>Suspicious Activity:</strong> Automated alerts for unusual behavior</li>
        <li><strong>Session Management:</strong> View and manage active user sessions</li>
        <li><strong>Audit Logs:</strong> Complete record of all admin actions</li>
      </ul>
      
      <h4>Investigating Security Incidents</h4>
      <ol>
        <li>Navigate to Security Monitoring</li>
        <li>Review recent alerts and events</li>
        <li>Click on incident for detailed information</li>
        <li>Check related audit logs</li>
        <li>Take appropriate action (force logout, suspend account, etc.)</li>
      </ol>
    `,
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    content: `
      <h3>Common Issues and Solutions</h3>
      
      <h4>User Cannot Access Course</h4>
      <p><strong>Possible Causes:</strong></p>
      <ul>
        <li>Payment not processed</li>
        <li>Account suspended</li>
        <li>Course unpublished</li>
        <li>Enrollment expired</li>
      </ul>
      <p><strong>Solution:</strong></p>
      <ol>
        <li>Check user's payment history</li>
        <li>Verify account status</li>
        <li>Confirm course is published</li>
        <li>Use manual enrollment if needed</li>
      </ol>
      
      <h4>Email Notifications Not Sending</h4>
      <p><strong>Check:</strong></p>
      <ul>
        <li>Email service configuration in System Settings</li>
        <li>User's email address validity</li>
        <li>Email template configuration</li>
        <li>System logs for email errors</li>
      </ul>
      
      <h4>Performance Issues</h4>
      <p><strong>Monitor:</strong></p>
      <ul>
        <li>System health dashboard</li>
        <li>Database performance metrics</li>
        <li>User load and concurrent sessions</li>
        <li>Error rates and response times</li>
      </ul>
      
      <h4>Data Export Problems</h4>
      <p><strong>If exports fail:</strong></p>
      <ol>
        <li>Check data size limits</li>
        <li>Verify export permissions</li>
        <li>Try smaller date ranges</li>
        <li>Check system storage space</li>
      </ol>
      
      <h4>Getting Help</h4>
      <p>If you encounter issues not covered here:</p>
      <ul>
        <li>Use the help mode (? button) for contextual guidance</li>
        <li>Check audit logs for error details</li>
        <li>Contact technical support with specific error messages</li>
        <li>Include relevant user IDs and timestamps</li>
      </ul>
    `,
  },
];

const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
  initialSection = 'getting-started',
}) => {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [searchQuery, setSearchQuery] = useState('');

  const currentSection = documentationSections.find(section => section.id === activeSection);

  const filteredSections = documentationSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex h-[80vh]">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Admin Documentation</h2>
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <nav className="space-y-1">
            {filteredSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentSection ? (
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: currentSection.content }} />
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <p>No documentation found for the selected section.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DocumentationModal;