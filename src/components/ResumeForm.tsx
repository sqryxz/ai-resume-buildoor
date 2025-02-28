'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowPathIcon, PlusIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import ResumePreview from './ResumePreview';

export interface FormData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
  }[];
  extraCurriculars: {
    organization: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  skills: string[];
}

interface ResumeFormProps {
  sampleData?: FormData;
}

export default function ResumeForm({ sampleData }: ResumeFormProps) {
  const { register, control, handleSubmit, watch, reset, setValue } = useForm<FormData>({
    defaultValues: {
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        summary: ''
      },
      experience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
      education: [{ school: '', degree: '', field: '', graduationDate: '', gpa: '' }],
      extraCurriculars: [{ organization: '', role: '', startDate: '', endDate: '', description: '' }],
      skills: ['']
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enhancedContent, setEnhancedContent] = useState<FormData | null>(null);
  const formData = watch();

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience
  } = useFieldArray({ control, name: 'experience' });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation
  } = useFieldArray({ control, name: 'education' });

  const {
    fields: extraCurricularFields,
    append: appendExtraCurricular,
    remove: removeExtraCurricular
  } = useFieldArray({ control, name: 'extraCurriculars' });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill
  } = useFieldArray({ control, name: 'skills' });

  const onSubmit = async (data: FormData) => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to enhance resume');
      }

      if (result.format === 'json') {
        setEnhancedContent(result.content);
      } else {
        setError('Received unstructured content. Please try again.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyEnhancements = () => {
    if (!enhancedContent) return;
    reset(enhancedContent);
    setEnhancedContent(null);
  };

  const rejectEnhancements = () => {
    setEnhancedContent(null);
  };

  const loadSampleData = () => {
    if (sampleData) {
      reset(sampleData);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Add Sample Data Button */}
        {sampleData && (
          <button
            type="button"
            onClick={loadSampleData}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center justify-center mb-4"
          >
            <DocumentDuplicateIcon className="w-5 h-5 mr-2" />
            Load Sample Data
          </button>
        )}

        {/* Personal Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              {...register('personalInfo.name')}
              placeholder="Full Name"
              className="input-field"
            />
            <input
              {...register('personalInfo.email')}
              type="email"
              placeholder="Email"
              className="input-field"
            />
            <input
              {...register('personalInfo.phone')}
              placeholder="Phone"
              className="input-field"
            />
            <input
              {...register('personalInfo.location')}
              placeholder="Location"
              className="input-field"
            />
          </div>
          <textarea
            {...register('personalInfo.summary')}
            placeholder="Professional Summary"
            className="input-field mt-4 h-32 w-full"
          />
        </div>

        {/* Experience Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Experience</h2>
            <button
              type="button"
              onClick={() => appendExperience({ company: '', position: '', startDate: '', endDate: '', description: '' })}
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-1" /> Add Experience
            </button>
          </div>
          {experienceFields.map((field, index) => (
            <div key={field.id} className="mb-6 border-b pb-6 last:border-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  {...register(`experience.${index}.company`)}
                  placeholder="Company"
                  className="input-field"
                />
                <input
                  {...register(`experience.${index}.position`)}
                  placeholder="Position"
                  className="input-field"
                />
                <input
                  {...register(`experience.${index}.startDate`)}
                  placeholder="Start Date"
                  className="input-field"
                />
                <input
                  {...register(`experience.${index}.endDate`)}
                  placeholder="End Date"
                  className="input-field"
                />
              </div>
              <textarea
                {...register(`experience.${index}.description`)}
                placeholder="Description of your role and achievements"
                className="input-field mt-4 h-32 w-full"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="mt-2 text-red-600 hover:text-red-700 flex items-center"
                >
                  <TrashIcon className="w-4 h-4 mr-1" /> Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Education Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Education</h2>
            <button
              type="button"
              onClick={() => appendEducation({ school: '', degree: '', field: '', graduationDate: '', gpa: '' })}
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-1" /> Add Education
            </button>
          </div>
          {educationFields.map((field, index) => (
            <div key={field.id} className="mb-6 border-b pb-6 last:border-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  {...register(`education.${index}.school`)}
                  placeholder="School/University"
                  className="input-field"
                />
                <input
                  {...register(`education.${index}.degree`)}
                  placeholder="Degree"
                  className="input-field"
                />
                <input
                  {...register(`education.${index}.field`)}
                  placeholder="Field of Study"
                  className="input-field"
                />
                <input
                  {...register(`education.${index}.graduationDate`)}
                  placeholder="Graduation Date"
                  className="input-field"
                />
                <input
                  {...register(`education.${index}.gpa`)}
                  placeholder="GPA (Optional)"
                  className="input-field"
                />
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="mt-2 text-red-600 hover:text-red-700 flex items-center"
                >
                  <TrashIcon className="w-4 h-4 mr-1" /> Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Extra-Curriculars Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Extra-Curricular Activities</h2>
            <button
              type="button"
              onClick={() => appendExtraCurricular({ organization: '', role: '', startDate: '', endDate: '', description: '' })}
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-1" /> Add Activity
            </button>
          </div>
          {extraCurricularFields.map((field, index) => (
            <div key={field.id} className="mb-6 border-b pb-6 last:border-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  {...register(`extraCurriculars.${index}.organization`)}
                  placeholder="Organization"
                  className="input-field"
                />
                <input
                  {...register(`extraCurriculars.${index}.role`)}
                  placeholder="Role"
                  className="input-field"
                />
                <input
                  {...register(`extraCurriculars.${index}.startDate`)}
                  placeholder="Start Date"
                  className="input-field"
                />
                <input
                  {...register(`extraCurriculars.${index}.endDate`)}
                  placeholder="End Date"
                  className="input-field"
                />
              </div>
              <textarea
                {...register(`extraCurriculars.${index}.description`)}
                placeholder="Description of your involvement and achievements"
                className="input-field mt-4 h-32 w-full"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeExtraCurricular(index)}
                  className="mt-2 text-red-600 hover:text-red-700 flex items-center"
                >
                  <TrashIcon className="w-4 h-4 mr-1" /> Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Skills Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Skills</h2>
            <button
              type="button"
              onClick={() => appendSkill('')}
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-1" /> Add Skill
            </button>
          </div>
          <div className="space-y-4">
            {skillFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  {...register(`skills.${index}`)}
                  placeholder="Enter a skill"
                  className="input-field"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Enhanced Content Actions */}
        {enhancedContent && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
            <h3 className="font-semibold text-blue-800 mb-2">
              AI Enhancements Available
            </h3>
            <p className="text-blue-600 mb-4">
              We've enhanced your résumé content. Would you like to apply these improvements?
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={applyEnhancements}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Apply Enhancements
              </button>
              <button
                type="button"
                onClick={rejectEnhancements}
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50"
              >
                Keep Original
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
              Enhancing Content...
            </>
          ) : (
            'Enhance with AI'
          )}
        </button>
      </form>

      {/* Preview Panel */}
      <div className="sticky top-8 h-fit">
        <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
        <ResumePreview data={enhancedContent || formData} />
      </div>
    </div>
  );
} 