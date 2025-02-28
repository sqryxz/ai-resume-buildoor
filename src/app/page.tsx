'use client';

import React from 'react';
import ResumeForm from '../components/ResumeForm'

const sampleData = {
  personalInfo: {
    name: "Alex Thompson",
    email: "alex.thompson@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    summary: "Results-driven software engineer with 5+ years of experience in full-stack development. Specialized in React, Node.js, and cloud technologies. Led multiple successful projects delivering scalable solutions that improved user engagement by 40%. Passionate about clean code and mentoring junior developers."
  },
  experience: [
    {
      company: "TechCorp Solutions",
      position: "Senior Software Engineer",
      startDate: "2021-01",
      endDate: "Present",
      description: "• Led a team of 5 developers in rebuilding the company's flagship product using React and TypeScript\n• Implemented CI/CD pipeline reducing deployment time by 60%\n• Mentored 3 junior developers who were promoted to mid-level positions\n• Optimized database queries resulting in 30% faster page load times"
    },
    {
      company: "InnovateSoft Inc",
      position: "Software Engineer",
      startDate: "2018-06",
      endDate: "2020-12",
      description: "• Developed and maintained 10+ microservices using Node.js and Express\n• Collaborated with UX team to implement responsive design patterns\n• Reduced bug reports by 40% through implementation of comprehensive testing strategy\n• Contributed to open-source projects and internal development tools"
    }
  ],
  education: [
    {
      school: "University of California, Berkeley",
      degree: "Master of Science",
      field: "Computer Science",
      graduationDate: "2018",
      gpa: "3.8"
    },
    {
      school: "Stanford University",
      degree: "Bachelor of Science",
      field: "Software Engineering",
      graduationDate: "2016",
      gpa: "3.9"
    }
  ],
  extraCurriculars: [
    {
      organization: "Code for Good",
      role: "Technical Lead",
      startDate: "2019-03",
      endDate: "Present",
      description: "• Lead volunteer coding workshops for underprivileged youth\n• Developed curriculum for web development basics\n• Organized annual hackathon with 200+ participants"
    }
  ],
  skills: [
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "AWS",
    "Docker",
    "GraphQL",
    "CI/CD",
    "Agile Methodologies",
    "Team Leadership"
  ]
};

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        AI Resume Builder
      </h1>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
        Create a professional resume with AI assistance. Fill in your details on the left, and see a live preview on the right.
      </p>
      <div className="max-w-7xl mx-auto">
        <ResumeForm sampleData={sampleData} />
      </div>
    </div>
  )
} 