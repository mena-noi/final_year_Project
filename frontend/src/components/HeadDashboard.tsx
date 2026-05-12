import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { registerLecturer, uploadSchedule, fetchSchedules } from '../api/api';
import { ClassSchedule, Module } from '../types';
import {
  CalendarDaysIcon,
  ClockIcon,
  AcademicCapIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  MoonIcon,
  SunIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  UserCircleIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

interface HeadDashboardProps {
  onLogout?: () => void;
}

interface LecturerRecord {
  id: string;
  name: string;
  email: string;
  department: string;
  status: 'Active' | 'Pending';
  courses: number;
  lastActive: string;
}

type ScheduleType = 'semester' | 'yearly' | 'exam';

interface DepartmentSchedule {
  id: string;
  type: ScheduleType;
  fileName: string;
}


const HeadDashboard: React.FC<HeadDashboardProps> = ({ onLogout }) => {
  const { currentUser, logout } = useAuth();
  
  // State for different entities
  const classSchedules: ClassSchedule[] = [
    {
      id: '1',
      courseId: 'CS101',
      day: 'Monday',
      time: '09:00 AM - 10:30 AM',
      location: 'Room 301'
    },
    {
      id: '2',
      courseId: 'CS101',
      day: 'Wednesday',
      time: '09:00 AM - 10:30 AM',
      location: 'Room 301'
    }
  ];


  const [activeSection, setActiveSection] = useState<'overview' | 'schedule' | 'register'>('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLecturerForm, setShowLecturerForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Pending'>('All');
  const [lecturerForm, setLecturerForm] = useState({
    name: '',
    email: '',
    department: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [lecturers, setLecturers] = useState<LecturerRecord[]>([
    { id: '1', name: 'Dr. Hana Bekele', email: 'hana.bekele@haramaya.edu.et', department: 'Computer Science', status: 'Active', courses: 3, lastActive: 'Today' },
    { id: '2', name: 'Prof. Samuel Tadesse', email: 'samuel.tadesse@haramaya.edu.et', department: 'Information Systems', status: 'Pending', courses: 0, lastActive: 'Just invited' },
    { id: '3', name: 'Mekdes Alemu', email: 'mekdes.alemu@haramaya.edu.et', department: 'Software Engineering', status: 'Active', courses: 2, lastActive: 'Yesterday' }
  ]);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    academicYear: '',
    semester: '',
    department: '',
    file: null as File | null,
    fileName: ''
  });
  const [activeScheduleType, setActiveScheduleType] = useState<ScheduleType>('semester');
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [scheduleError, setScheduleError] = useState('');
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Fetch schedules from backend on mount
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const response = await fetchSchedules();
        setScheduleItems(response.schedules || []);
      } catch (error) {
        console.error('Failed to fetch schedules:', error);
      }
    };
    loadSchedules();
  }, []);

  // Logout handler
  const handleLogout = () => {
    logout();
    if (onLogout) {
      onLogout();
    }
  };


  const renderOverview = () => (
    <div className="space-y-8">
      <div className="glass-card p-8 text-center relative overflow-hidden">
        <h2 className="text-3xl font-bold gradient-text mb-2">Welcome back, Head {currentUser?.name}!</h2>
        <p className="text-gray-600 mb-4">Here's what's happening in your department today</p>
        <div className="flex justify-center space-x-4">
          <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
            <CheckCircleIcon className="w-5 h-5" />
            <span>All systems operational</span>
          </div>
          <div className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full">
            <InformationCircleIcon className="w-5 h-5" />
            <span>{lecturers.length} registered lecturers</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: ClockIcon, title: 'Class Schedules', value: classSchedules.length, bgColor: 'from-green-500 to-green-600', trend: '+8%' },
          { icon: PlusIcon, title: 'Register Lecturers', value: '-', bgColor: 'from-yellow-500 to-yellow-600', trend: 'Open form' },
          { icon: UserGroupIcon, title: 'Registered Lecturers', value: lecturers.length, bgColor: 'from-purple-500 to-purple-600', trend: 'Active accounts' }
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

  const filteredLecturers = lecturers.filter((lecturer) => {
    const matchesSearch = `${lecturer.name} ${lecturer.email} ${lecturer.department}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || lecturer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecturerForm.name || !lecturerForm.email || !lecturerForm.department || !lecturerForm.password || !lecturerForm.confirmPassword) {
      setFormError('All fields are required.');
      return;
    }
    if (lecturerForm.password !== lecturerForm.confirmPassword) {
      setFormError('Password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await registerLecturer(
        currentUser?.email || '',
        lecturerForm.name,
        lecturerForm.email,
        lecturerForm.department,
        lecturerForm.password
      );

      const newLecturer: LecturerRecord = {
        id: Date.now().toString(),
        name: lecturerForm.name,
        email: lecturerForm.email,
        department: lecturerForm.department,
        status: 'Active',
        courses: 0,
        lastActive: 'Just created'
      };

      setLecturers((prev) => [newLecturer, ...prev]);
      setLecturerForm({ name: '', email: '', department: '', password: '', confirmPassword: '' });
      setShowLecturerForm(false);
    } catch (error: any) {
      setFormError(error?.message || 'Failed to register lecturer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRegisterLecturers = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold gradient-text">Register Lecturers</h2>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Add and manage lecturer accounts for your department.
            </p>
          </div>
          <button
            onClick={() => setShowLecturerForm((prev) => !prev)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Register New Lecturer</span>
          </button>
        </div>
      </div>

      {showLecturerForm && (
        <form onSubmit={handleCreateLecturer} className="glass-card p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={lecturerForm.name}
            onChange={(e) => setLecturerForm((prev) => ({ ...prev, name: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={lecturerForm.email}
            onChange={(e) => setLecturerForm((prev) => ({ ...prev, email: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            placeholder="Department"
            value={lecturerForm.department}
            onChange={(e) => setLecturerForm((prev) => ({ ...prev, department: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={lecturerForm.password}
            onChange={(e) => setLecturerForm((prev) => ({ ...prev, password: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={lecturerForm.confirmPassword}
            onChange={(e) => setLecturerForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Saving...' : 'Save Lecturer'}
          </button>
          {formError && (
            <p className="text-red-600 text-sm md:col-span-2 lg:col-span-3">{formError}</p>
          )}
        </form>
      )}

      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by lecturer name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Active' | 'Pending')}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={isDarkMode ? 'text-gray-300 border-b border-gray-700' : 'text-gray-500 border-b'}>
                <th className="py-3">LECTURER</th>
                <th className="py-3">DEPARTMENT</th>
                <th className="py-3">STATUS</th>
                <th className="py-3">COURSES</th>
                <th className="py-3">LAST ACTIVITY</th>
              </tr>
            </thead>
            <tbody>
              {filteredLecturers.map((lecturer) => (
                <tr key={lecturer.id} className={isDarkMode ? 'border-b border-gray-800' : 'border-b'}>
                  <td className="py-3">
                    <div className="font-semibold">{lecturer.name}</div>
                    <div className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{lecturer.email}</div>
                  </td>
                  <td className="py-3">{lecturer.department}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      lecturer.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {lecturer.status}
                    </span>
                  </td>
                  <td className="py-3">{lecturer.courses}</td>
                  <td className="py-3">{lecturer.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const scheduleTypeLabel: Record<ScheduleType, string> = {
    semester: 'Semester Schedule',
    yearly: 'Yearly Calendar',
    exam: 'Exam Schedule'
  };

  const typeMapping: Record<ScheduleType, string> = {
    semester: 'semester_schedule',
    yearly: 'yearly_calendar',
    exam: 'exam_schedule'
  };
  const visibleSchedules = scheduleItems.filter((item) => item.type === typeMapping[activeScheduleType]);

  const handleAddScheduleItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.title || !scheduleForm.academicYear || !scheduleForm.department || !scheduleForm.file) {
      setScheduleError('Please fill all required fields and upload a file.');
      return;
    }

    setScheduleLoading(true);
    setScheduleError('');

    try {
      const formData = new FormData();
      formData.append('file', scheduleForm.file);
      formData.append('title', scheduleForm.title);
      formData.append('type', activeScheduleType === 'yearly' ? 'yearly_calendar' : activeScheduleType === 'semester' ? 'semester_schedule' : 'exam_schedule');
      formData.append('academicYear', scheduleForm.academicYear);
      formData.append('semester', scheduleForm.semester || '');
      formData.append('department', scheduleForm.department);

      const response = await uploadSchedule(formData);

      setScheduleItems((prev) => [response.schedule, ...prev]);
      setScheduleForm({ title: '', academicYear: '', semester: '', department: '', file: null, fileName: '' });
    } catch (error: any) {
      setScheduleError(error?.message || 'Failed to upload schedule. Please try again.');
    } finally {
      setScheduleLoading(false);
    }
  };

  const renderScheduleSection = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold gradient-text mb-2">Department Schedules</h2>
        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Choose a schedule type, then add items for that section.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { type: 'semester' as ScheduleType, label: 'Semester Schedule', icon: ClockIcon },
          { type: 'yearly' as ScheduleType, label: 'Yearly Calendar', icon: CalendarDaysIcon },
          { type: 'exam' as ScheduleType, label: 'Exam Schedule', icon: BookOpenIcon }
        ].map((option) => (
          <button
            key={option.type}
            onClick={() => setActiveScheduleType(option.type)}
            className={`glass-card p-5 text-left transition-all ${
              activeScheduleType === option.type
                ? 'ring-2 ring-primary-500 border-primary-400'
                : 'hover:shadow-lg'
            }`}
          >
            <option.icon className="w-7 h-7 mb-2 text-primary-600" />
            <p className="font-semibold">{option.label}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleAddScheduleItem} className="glass-card p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Schedule Title *"
          value={scheduleForm.title}
          onChange={(e) => setScheduleForm((prev) => ({ ...prev, title: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
        <input
          type="text"
          placeholder="Academic Year * (e.g. 2024-2025)"
          value={scheduleForm.academicYear}
          onChange={(e) => setScheduleForm((prev) => ({ ...prev, academicYear: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
        <input
          type="text"
          placeholder="Semester (e.g. Fall, Spring)"
          value={scheduleForm.semester}
          onChange={(e) => setScheduleForm((prev) => ({ ...prev, semester: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="text"
          placeholder="Department *"
          value={scheduleForm.department}
          onChange={(e) => setScheduleForm((prev) => ({ ...prev, department: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
        <label className="px-3 py-2 rounded-lg border border-dashed border-gray-300 text-sm cursor-pointer hover:bg-gray-50 flex items-center">
          <span className="truncate">{scheduleForm.fileName || 'Upload Schedule File *'}</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              setScheduleForm((prev) => ({ ...prev, file: selectedFile, fileName: selectedFile?.name || '' }));
            }}
            className="hidden"
            required
          />
        </label>
        <button
          type="submit"
          disabled={scheduleLoading}
          className={`bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg ${scheduleLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {scheduleLoading ? 'Uploading...' : `Add ${scheduleTypeLabel[activeScheduleType]}`}
        </button>
        {scheduleError && <p className="text-red-600 text-sm md:col-span-2 lg:col-span-3">{scheduleError}</p>}
      </form>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-3">{scheduleTypeLabel[activeScheduleType]} Items</h3>
        {visibleSchedules.length === 0 ? (
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            No items added yet. Use the form above to add one.
          </p>
        ) : (
          <div className="space-y-3">
            {visibleSchedules.map((item: any) => (
              <div key={item._id} className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'}`}>
                <p className="font-semibold text-base">{item.title}</p>
                <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>
                  {item.academicYear && `Year: ${item.academicYear}`}
                  {item.semester && ` | Semester: ${item.semester}`}
                  {item.department && ` | Dept: ${item.department}`}
                </p>
                {item.fileUrl && (
                  <a
                    href={`http://localhost:3000${item.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                  >
                    📎 Download {item.fileName || 'File'}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );


  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-primary-50 to-secondary-50'
    }`}>
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
                <h1 className="text-2xl font-bold gradient-text">Head of Department Dashboard</h1>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {currentUser?.name} • Head of Department • {currentUser?.department}
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
                  <h3 className="text-lg font-bold mb-1">Head Profile</h3>
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
                    {passwordSuccess && <p className="text-green-600 text-xs">{passwordSuccess}</p>}
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
              { key: 'schedule', label: 'Schedule', icon: ClockIcon },
              { key: 'register', label: 'Register Lecturers', icon: PlusIcon }
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
        {activeSection === 'schedule' && renderScheduleSection()}
        {activeSection === 'register' && renderRegisterLecturers()}
        {/* Add other sections content here as needed */}
      </main>
    </div>
  );
};

export default HeadDashboard;
