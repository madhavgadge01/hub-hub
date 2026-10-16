import React, { useState } from 'react';
import { X, Send, Briefcase, User, Mail, Globe, Code2, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const JobApplicationModal = ({ job, isOpen, onClose }) => {
  const { addToast } = useApp();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    githubUrl: '',
    portfolioUrl: '',
    experience: '3-5 years',
    coverNote: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate clean application submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      addToast(`Application for ${job.title} received! We will be in touch shortly.`, 'success', 5000);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          fullName: '',
          email: '',
          githubUrl: '',
          portfolioUrl: '',
          experience: '3-5 years',
          coverNote: '',
        });
        onClose();
      }, 1500);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-xl rounded-3xl border dark:bg-[#0c0c0c] bg-white dark:border-[#222222] border-[#eaeaea] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b dark:border-[#1f1f1f] border-[#eaeaea] flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Briefcase className="w-3 h-3" />
              <span>{job.department} • {job.location}</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight dark:text-white text-black font-sans">
              Apply for {job.title}
            </h3>
            <p className="text-xs dark:text-neutral-400 text-neutral-500 font-mono">
              Compensation: {job.salary} • {job.type}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        {isSubmitted ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold dark:text-white text-black">
              Application Successfully Dispatched!
            </h4>
            <p className="text-xs dark:text-neutral-400 text-neutral-600 max-w-md mx-auto">
              Thank you for applying to Kruu. Our engineering leadership and talent team review all submissions within 48 business hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold dark:text-neutral-300 text-neutral-700">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Satoshi Nakamoto"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border dark:bg-black bg-white dark:border-[#2a2a2a] border-[#e0e0e0] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold dark:text-neutral-300 text-neutral-700">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="dev@domain.io"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border dark:bg-black bg-white dark:border-[#2a2a2a] border-[#e0e0e0] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold dark:text-neutral-300 text-neutral-700">
                  GitHub Profile URL *
                </label>
                <div className="relative">
                  <Code2 className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/username"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border dark:bg-black bg-white dark:border-[#2a2a2a] border-[#e0e0e0] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold dark:text-neutral-300 text-neutral-700">
                  Portfolio / LinkedIn URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/profile"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border dark:bg-black bg-white dark:border-[#2a2a2a] border-[#e0e0e0] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold dark:text-neutral-300 text-neutral-700">
                Years of Relevant Experience
              </label>
              <select
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border dark:bg-black bg-white dark:border-[#2a2a2a] border-[#e0e0e0] dark:text-white text-black focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="1-3 years">1–3 Years (Early Career)</option>
                <option value="3-5 years">3–5 Years (Mid-level)</option>
                <option value="5-8 years">5–8 Years (Senior)</option>
                <option value="8+ years">8+ Years (Staff / Principal)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold dark:text-neutral-300 text-neutral-700">
                Tell Us About Your Work & Why Kruu *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Share a standout systems problem you solved, or what developer tooling challenge excites you most..."
                value={formData.coverNote}
                onChange={(e) => setFormData({ ...formData, coverNote: e.target.value })}
                className="w-full p-3 text-xs rounded-xl border dark:bg-black bg-white dark:border-[#2a2a2a] border-[#e0e0e0] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Submission Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <span>Submit Application</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default JobApplicationModal;
