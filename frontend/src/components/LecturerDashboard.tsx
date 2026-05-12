import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Update, Module, LecturerExamBlockAnnouncement } from '../types';
import { apiClient } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
  BellIcon,
  BookOpenIcon,
  ArrowPathIcon,
  ChartBarIcon,
  MoonIcon,
  SunIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  UserCircleIcon,
  KeyIcon,
  CalendarDaysIcon,
  TrashIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';

interface LecturerDashboardProps {
  onLogout?: () => void;
}

interface LecturerModuleRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  addedBy: string;
  createdAt: string;
  pdfFileName?: string;
  batchYear?: string;
}

const EXAM_ANNOUNCEMENTS_KEY = 'lecturerExamBlockAnnouncements';

function loadExamAnnouncements(): LecturerExamBlockAnnouncement[] {
  try {
    const raw = localStorage.getItem(EXAM_ANNOUNCEMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const LecturerDashboard: React.FC<LecturerDashboardProps> = ({ onLogout }) => {
  const { currentUser, logout } = useAuth();

  const [examAnnouncements, setExamAnnouncements] = useState<LecturerExamBlockAnnouncement[]>(loadExamAnnouncements);
  const [examForm, setExamForm] = useState({
    title: '',
    startDate: '',
    endDate: '',
    messageToStudents: '',
    attachmentFileName: ''
  });
  const [examFormError, setExamFormError] = useState('');

  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    courseCode: '',
    materialType: 'lecture_note',
    pdfFile: null as File | null,
    batchYear: '' as string
  });
  const [moduleError, setModuleError] = useState('');
  const [lecturerModules, setLecturerModules] = useState<LecturerModuleRecord[]>([]);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleForm, setEditModuleForm] = useState({ title: '', category: '', description: '' });

  useEffect(() => {
    localStorage.setItem(EXAM_ANNOUNCEMENTS_KEY, JSON.stringify(examAnnouncements));
    window.dispatchEvent(new Event('lecturerExamNoticesUpdated'));
  }, [examAnnouncements]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await apiClient.getCourseMaterials();
        setLecturerModules(response.materials || []);
      } catch (error) {
        console.error('Failed to load modules:', error);
      }
    };
    fetchModules();
  }, []);

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleForm.title || !moduleForm.description || !moduleForm.courseCode || !moduleForm.batchYear) {
      setModuleError('Please fill all module fields including batch year.');
      return;
    }

    try {
      const metadata = {
        title: moduleForm.title,
        description: moduleForm.description,
        materialType: moduleForm.materialType,
        courseCode: moduleForm.courseCode,
        department: currentUser?.department || 'General',
        targetBatchYears: moduleForm.batchYear || '1'
      };

      // Ensure we have a file or provide a dummy one for the backend requirement
      const fileToUpload = moduleForm.pdfFile || new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
      
      const response = await apiClient.uploadMaterial(fileToUpload, metadata);
      
      const newModule = {
        id: response.material._id,
        title: response.material.title,
        description: response.material.description,
        category: response.material.courseCode + ' - ' + response.material.materialType,
        addedBy: currentUser?.name || 'Lecturer',
        createdAt: response.material.createdAt,
        pdfFileName: response.material.fileName || undefined
      };

      setLecturerModules(prev => [newModule, ...prev]);
      setModuleForm({ title: '', description: '', courseCode: '', materialType: 'lecture_note', pdfFile: null, batchYear: '' });
      setModuleError('');
      addNotification('Module added successfully.');
    } catch (error) {
      console.error('Add module error:', error);
      setModuleError('Failed to add module to backend.');
    }
  };

  const handleStartEditModule = (module: LecturerModuleRecord) => {
    setEditingModuleId(module.id);
    setEditModuleForm({
      title: module.title,
      category: module.category,
      description: module.description
    });
  };

  const handleSaveEditedModule = async (moduleId: string) => {
    if (!editModuleForm.title || !editModuleForm.category || !editModuleForm.description) {
      return;
    }

    try {
      const metadata = {
        title: editModuleForm.title,
        description: editModuleForm.description,
        materialType: editModuleForm.category
      };
      
      await apiClient.updateCourseMaterial(moduleId, metadata);

      setLecturerModules(prev => prev.map((module) =>
        module.id === moduleId ? { ...module, ...editModuleForm } : module
      ));
      setEditingModuleId(null);
      addNotification('Module updated successfully.');
    } catch (error) {
      console.error('Failed to update module:', error);
      addNotification('Failed to update module.');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await apiClient.deleteCourseMaterial(moduleId);
      setLecturerModules(prev => prev.filter((module) => module.id !== moduleId));
      if (editingModuleId === moduleId) {
        setEditingModuleId(null);
      }
      addNotification('Module deleted successfully.');
    } catch (error) {
      console.error('Failed to delete module:', error);
      addNotification('Failed to delete module.');
    }
  };

  const updates: Update[] = [
    {
      id: '1',
      title: 'Assignment Deadline Extended',
      content: 'The deadline for Project 2 has been extended to Friday at 11:59 PM.',
      postedBy: 'Prof. Sarah Johnson',
      postedAt: new Date('2024-11-10T10:30:00'),
      category: 'general'
    },
    {
      id: '2',
      title: 'Extra Tutorial Session',
      content: 'Additional tutorial session this Thursday at 2 PM in Room 205.',
      postedBy: 'Dr. Elias Kemal',
      postedAt: new Date('2024-11-09T14:00:00'),
      category: 'exam'
    }
  ];



  const [activeSection, setActiveSection] = useState<'overview' | 'exam-blocks' | 'updates' | 'modules'>('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  // Add notification helper
  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 3000);
  };

  // Logout handler
  const handleLogout = () => {
    logout();
    if (onLogout) {
      onLogout();
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Please fill all password fields.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    try {
      await apiClient.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addNotification('Password changed successfully.');
      setShowProfilePanel(false);
    } catch (error: any) {
      console.error('Password change error:', error);
      setPasswordError(error.message || 'Failed to change password.');
    }
  };

  const handlePublishExamAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setExamFormError('');
    if (!examForm.title.trim() || !examForm.messageToStudents.trim()) {
      setExamFormError('Title and message to students are required.');
      return;
    }
    if (!examForm.startDate || !examForm.endDate) {
      setExamFormError('Start and end dates are required.');
      return;
    }
    const start = new Date(examForm.startDate);
    const end = new Date(examForm.endDate);
    if (end < start) {
      setExamFormError('End date must be on or after the start date.');
      return;
    }

    try {
      const noticePayload = {
        title: examForm.title.trim(),
        examDate: examForm.startDate,
        examMessage: examForm.messageToStudents.trim(),
        courseCode: 'GENERAL', // Placeholder for now
        department: currentUser?.department || 'General',
        targetBatchYears: 1 // Placeholder for now
      };

      const response = await apiClient.createExamNotice(noticePayload);

      const entry: LecturerExamBlockAnnouncement = {
        id: response.examNotice._id,
        title: response.examNotice.title,
        messageToStudents: response.examNotice.examMessage || '',
        startDate: response.examNotice.examDate,
        endDate: response.examNotice.examDate,
        attachmentFileName: examForm.attachmentFileName || undefined,
        postedBy: currentUser?.name || 'Lecturer',
        postedAt: response.examNotice.createdAt || new Date().toISOString()
      };
      
      setExamAnnouncements((prev) => [entry, ...prev]);
      setExamForm({
        title: '',
        startDate: '',
        endDate: '',
        messageToStudents: '',
        attachmentFileName: ''
      });
      addNotification('Students will see this exam block notice on their home dashboard.');
    } catch (error) {
      console.error('Failed to create exam notice:', error);
      setExamFormError('Failed to publish exam notice to backend.');
    }
  };

  const handleDeleteExamAnnouncement = (id: string) => {
    setExamAnnouncements((prev) => prev.filter((a) => a.id !== id));
    addNotification('Exam block notice removed.');
  };

  const formatExamDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  const renderExamBlocksSection = () => {
    const card = isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900';
    const label = isDarkMode ? 'text-gray-300' : 'text-gray-600';
    return (
      <div className="space-y-8">
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold gradient-text mb-2">Exam block notices for students</h2>
          <p className={label}>
            When there is an exam period, write instructions here and optionally attach a file (PDF, Word, etc.).
            Students see these notices on their home dashboard.
          </p>
        </div>

        <form onSubmit={handlePublishExamAnnouncement} className={`glass-card p-6 space-y-4 border ${card}`}>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CalendarDaysIcon className="w-6 h-6" />
            New exam block notice
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${label}`}>Title *</label>
              <input
                type="text"
                value={examForm.title}
                onChange={(e) => setExamForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Midterm exam week — CS Department"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${label}`}>Optional attachment</label>
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-400 cursor-pointer hover:bg-gray-50 text-sm text-gray-700">
                <DocumentArrowUpIcon className="w-5 h-5 shrink-0" />
                <span className="truncate">{examForm.attachmentFileName || 'Choose file (PDF, DOC…)'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setExamForm((prev) => ({ ...prev, attachmentFileName: f?.name || '' }));
                  }}
                />
              </label>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${label}`}>Exam block starts *</label>
              <input
                type="date"
                value={examForm.startDate}
                onChange={(e) => setExamForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${label}`}>Exam block ends *</label>
              <input
                type="date"
                value={examForm.endDate}
                onChange={(e) => setExamForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm"
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${label}`}>Message to students *</label>
            <textarea
              value={examForm.messageToStudents}
              onChange={(e) => setExamForm((f) => ({ ...f, messageToStudents: e.target.value }))}
              placeholder="Exam rules, timetable notes, room numbers, what to bring…"
              rows={5}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm"
            />
          </div>
          {examFormError && <p className="text-red-600 text-sm">{examFormError}</p>}
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium"
          >
            Publish to students
          </button>
        </form>

        <div className={`glass-card p-6 border ${card}`}>
          <h3 className="text-lg font-semibold mb-4">Published notices</h3>
          {examAnnouncements.length === 0 ? (
            <p className={label}>No exam block notices yet. Create one above.</p>
          ) : (
            <ul className="space-y-4">
              {examAnnouncements.map((a) => (
                <li
                  key={a.id}
                  className={`p-4 rounded-xl border ${
                    isDarkMode ? 'border-gray-600 bg-gray-900/40' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-lg">{a.title}</p>
                      <p className={`text-sm ${label}`}>
                        {formatExamDate(a.startDate)} — {formatExamDate(a.endDate)}
                      </p>
                      <p className={`mt-2 whitespace-pre-wrap ${label}`}>{a.messageToStudents}</p>
                      {a.attachmentFileName && (
                        <p className="text-sm text-blue-600 mt-2">Attached: {a.attachmentFileName}</p>
                      )}
                      <p className={`text-xs mt-2 ${label}`}>
                        Posted by {a.postedBy} · {new Date(a.postedAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteExamAnnouncement(a.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                      title="Remove notice"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  const renderUpdatesSection = () => (
    <div className="space-y-4">
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold gradient-text mb-2">Updates</h2>
        <p className="text-gray-600">Recent announcements (sample data).</p>
      </div>
      {updates.map((u) => (
        <div key={u.id} className="glass-card p-4 border border-gray-100">
          <p className="font-semibold">{u.title}</p>
          <p className="text-gray-600 text-sm mt-1">{u.content}</p>
          <p className="text-xs text-gray-400 mt-2">{u.postedBy}</p>
        </div>
      ))}
    </div>
  );

  const renderModulesSection = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold gradient-text mb-2">Modules</h2>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Upload and manage your course modules here.
        </p>
      </div>

      <form onSubmit={handleAddModule} className="glass-card p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Module Title"
          value={moduleForm.title}
          onChange={(e) => setModuleForm((prev) => ({ ...prev, title: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="text"
          placeholder="Course Code (e.g. CS101)"
          value={moduleForm.courseCode}
          onChange={(e) => setModuleForm((prev) => ({ ...prev, courseCode: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={moduleForm.materialType}
          onChange={(e) => setModuleForm((prev) => ({ ...prev, materialType: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="lecture_note">Lecture Note</option>
          <option value="assignment">Assignment</option>
          <option value="reference">Reference</option>
          <option value="other">Other</option>
        </select>
        <select
          value={moduleForm.batchYear}
          onChange={(e) => setModuleForm((prev) => ({ ...prev, batchYear: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">Select Batch Year</option>
          <option value="1">Year 1</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
          <option value="5">Year 5</option>
        </select>
        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg">
          Add Module
        </button>
        <label className="md:col-span-4 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm cursor-pointer hover:bg-gray-50 text-gray-700 bg-white">
          Upload PDF
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              setModuleForm((prev) => ({ ...prev, pdfFile: selectedFile }));
            }}
            className="hidden"
          />
          <span className="block text-xs text-gray-500 mt-1 truncate">
            {moduleForm.pdfFile ? moduleForm.pdfFile.name : 'No PDF selected'}
          </span>
        </label>
        <textarea
          placeholder="Module Description"
          value={moduleForm.description}
          onChange={(e) => setModuleForm((prev) => ({ ...prev, description: e.target.value }))}
          className="md:col-span-4 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
          rows={3}
        />
        {moduleError && <p className="text-red-600 text-sm md:col-span-4">{moduleError}</p>}
      </form>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-3">Your Modules</h3>
        {lecturerModules.length === 0 ? (
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No modules uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {lecturerModules.map((module) => (
              <div key={module.id} className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'}`}>
                {editingModuleId === module.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editModuleForm.title}
                      onChange={(e) => setEditModuleForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white text-gray-900"
                    />
                    <input
                      type="text"
                      value={editModuleForm.category}
                      onChange={(e) => setEditModuleForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white text-gray-900"
                    />
                    <textarea
                      value={editModuleForm.description}
                      onChange={(e) => setEditModuleForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white text-gray-900"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveEditedModule(module.id)}
                        className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingModuleId(null)}
                        className="px-3 py-1.5 rounded-lg bg-gray-500 text-white text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900">{module.title}</p>
                    <p className={isDarkMode ? 'text-gray-300 text-sm' : 'text-gray-600 text-sm'}>{module.category}</p>
                    <p className={isDarkMode ? 'text-gray-400 text-sm mt-1' : 'text-gray-500 text-sm mt-1'}>{module.description}</p>
                    {module.pdfFileName && (
                      <p className={isDarkMode ? 'text-blue-300 text-xs mt-1' : 'text-blue-600 text-xs mt-1'}>
                        PDF: {module.pdfFileName}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => handleStartEditModule(module)}
                        className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteModule(module.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="glass-card p-8 text-center relative overflow-hidden">
        <h2 className="text-3xl font-bold gradient-text mb-2">Welcome back, Prof. {currentUser?.name}!</h2>
        <p className="text-gray-600 mb-4">Here's what's happening in your teaching dashboard today</p>
        <div className="flex justify-center space-x-4">
          <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
            <CheckCircleIcon className="w-5 h-5" />
            <span>All systems operational</span>
          </div>
          <div className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
            <InformationCircleIcon className="w-5 h-5" />
            <span>{updates.length} active updates</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: BellIcon, title: 'Exam Blocks', value: examAnnouncements.length, bgColor: 'from-yellow-500 to-yellow-600', trend: '+15%' },
          { icon: ArrowPathIcon, title: 'Updates Posted', value: updates.length, bgColor: 'from-purple-500 to-purple-600', trend: '+5%' },
          { icon: BookOpenIcon, title: 'Modules', value: lecturerModules.length, bgColor: 'from-indigo-500 to-indigo-600', trend: '+8%' }
        ].map((stat, index) => (
          <div key={stat.title} className="glass-card p-6 text-center">
            <div className={`p-4 bg-gradient-to-r ${stat.bgColor} rounded-2xl mx-auto mb-4 w-fit`}>
              <stat.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 mb-2">{stat.title}</p>
            <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
              {stat.trend} this month
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-primary-50 to-secondary-50'
    }`}>
      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span>{notification}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header */}
      <header className={`${
        isDarkMode 
          ? 'bg-gray-800/90 backdrop-blur-xl shadow-lg border-b border-gray-700' 
          : 'bg-white/90 backdrop-blur-xl shadow-lg border-b'
        } sticky top-0 z-40`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Lecturer Dashboard</h1>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Prof. {currentUser?.name} • Lecturer • {currentUser?.department}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 relative">
              <button
                onClick={() => setShowProfilePanel((prev) => !prev)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-blue-300'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                }`}
                title="Profile"
              >
                <UserCircleIcon className="w-6 h-6" />
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
              </button>
              <button
                onClick={handleLogout}
                className={`px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  isDarkMode 
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                    : 'bg-red-100 hover:bg-red-200 text-red-600'
                }`}
              >
                Logout
              </button>

              {showProfilePanel && (
                <div className={`absolute right-0 top-16 w-80 rounded-xl shadow-2xl border p-4 z-50 ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <h3 className="text-lg font-bold mb-1">Lecturer Profile</h3>
                  <p className={isDarkMode ? 'text-gray-300 text-sm' : 'text-gray-600 text-sm'}>
                    {currentUser?.name}
                  </p>
                  <p className={isDarkMode ? 'text-gray-400 text-xs mb-3' : 'text-gray-500 text-xs mb-3'}>
                    {currentUser?.email} • {currentUser?.department}
                  </p>

                  <form onSubmit={handleChangePassword} className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm font-semibold mb-1">
                      <KeyIcon className="w-4 h-4" />
                      <span>Change Password</span>
                    </div>
                    <input
                      type="password"
                      placeholder="Current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    />
                    <input
                      type="password"
                      placeholder="New password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                    />
                    {passwordError && <p className="text-red-500 text-xs">{passwordError}</p>}
                    <button
                      type="submit"
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg text-sm font-medium"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`${
        isDarkMode 
          ? 'bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-gray-700' 
          : 'bg-white/80 backdrop-blur-lg shadow-sm border-b'
        } sticky top-16 z-30`}
      >
        <div className="container mx-auto px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: ChartBarIcon },
              { key: 'exam-blocks', label: 'Exam Blocks', icon: BellIcon },
              { key: 'updates', label: 'Updates', icon: ArrowPathIcon },
              { key: 'modules', label: 'Modules', icon: BookOpenIcon }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key as any)}
                className={`nav-tab flex items-center space-x-3 px-6 py-4 border-b-4 transition-all duration-300 whitespace-nowrap ${
                  activeSection === tab.key 
                    ? `border-primary-600 ${
                        isDarkMode 
                          ? 'text-primary-400 bg-primary-900/20' 
                          : 'text-primary-600 bg-gradient-to-r from-primary-50 to-transparent'
                      }` 
                    : `border-transparent ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'exam-blocks' && renderExamBlocksSection()}
        {activeSection === 'updates' && renderUpdatesSection()}
        {activeSection === 'modules' && renderModulesSection()}
      </main>
    </div>
  );
};

export default LecturerDashboard;
