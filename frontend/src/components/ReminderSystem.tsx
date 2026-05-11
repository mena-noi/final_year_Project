import React, { useState } from 'react';
import { BellIcon, PlusIcon, TrashIcon, CheckIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Reminder } from '../types';

interface ReminderSystemProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  className?: string;
}

const ReminderSystem: React.FC<ReminderSystemProps> = ({
  reminders,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
  className = ''
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;

    onAddReminder({
      title: newReminderTitle.trim(),
      isCompleted: false
    });
    setNewReminderTitle('');
    setShowAddForm(false);
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'No date';
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="bg-secondary-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <BellIcon className="w-6 h-6 mr-2" />
            Smart Reminders
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-2 bg-secondary-500 hover:bg-secondary-700 rounded-full transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Add Reminder Form */}
      {showAddForm && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={newReminderTitle}
                onChange={(e) => setNewReminderTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter reminder title"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Add Reminder
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reminders List */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ClockIcon className="w-5 h-5 mr-2" />
          Your Reminders
        </h3>
        
        {reminders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No reminders yet. Click + to add one.
          </p>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`p-3 border rounded-lg ${reminder.isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => onToggleReminder(reminder.id)}
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                        reminder.isCompleted
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {reminder.isCompleted && <CheckIcon className="w-3 h-3 text-white" />}
                    </button>
                    
                    <div className="flex-1">
                      <h4 className={`font-medium ${reminder.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {reminder.title}
                      </h4>
                      {reminder.description && (
                        <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                      )}
                      {reminder.dueDate && (
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {formatDate(reminder.dueDate)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onDeleteReminder(reminder.id)}
                    className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderSystem;