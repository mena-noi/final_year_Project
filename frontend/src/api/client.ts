const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string, role?: string) {
    const endpoint = role === 'lecturer' || role === 'department_head' ? '/api/auth/lecturer/login' : '/api/auth/student/login';
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: { name: string; email: string; password: string; batchYear?: string; department?: string; role?: string }) {
    const endpoint = userData.role === 'lecturer' ? '/api/auth/lecturer/register' : '/api/auth/student/register';
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/api/auth/lecturer/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Schedule endpoints
  async getSchedules(type?: string) {
    const endpoint = type ? `/api/schedules/type/${type}` : '/api/schedules';
    return this.request(endpoint);
  }

  async getScheduleById(id: string) {
    return this.request(`/api/schedules/${id}`);
  }

  async uploadSchedule(file: File, type: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/api/schedules/upload', {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData,
    });
  }

  async deleteSchedule(id: string) {
    return this.request(`/api/schedules/${id}`, {
      method: 'DELETE',
    });
  }

  // Reminder endpoints
  async getReminders() {
    return this.request('/api/reminders/student');
  }

  async getReminderById(id: string) {
    return this.request(`/api/reminders/student/${id}`);
  }

  async createReminder(reminder: any) {
    return this.request('/api/reminders/student', {
      method: 'POST',
      body: JSON.stringify(reminder),
    });
  }

  async updateReminder(id: string, reminder: any) {
    return this.request(`/api/reminders/student/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reminder),
    });
  }

  async deleteReminder(id: string) {
    return this.request(`/api/reminders/student/${id}`, {
      method: 'DELETE',
    });
  }

  async getUpcomingReminders() {
    return this.request('/api/reminders/student/upcoming');
  }

  async getReminderStats() {
    return this.request('/api/reminders/student/stats');
  }

  async bulkCreateReminders(reminders: any[]) {
    return this.request('/api/reminders/student/bulk', {
      method: 'POST',
      body: JSON.stringify({ reminders }),
    });
  }

  async getScheduleReminders(scheduleId: string) {
    return this.request(`/api/reminders/student/schedule/${scheduleId}`);
  }

  // Exam endpoints
  async getExamNotices() {
    return this.request('/api/exams/student');
  }

  async createExamNotice(notice: any) {
    return this.request('/api/exams/notice', {
      method: 'POST',
      body: JSON.stringify(notice),
    });
  }

  // Upload endpoints
  async uploadMaterial(file: File, metadata?: any) {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });
    }

    return this.request('/api/upload/material', {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData,
    });
  }

  async getCourseMaterials() {
    return this.request('/api/upload/material/lecturer');
  }

  async updateCourseMaterial(id: string, metadata: any) {
    return this.request(`/api/upload/material/${id}`, {
      method: 'PUT',
      body: JSON.stringify(metadata),
    });
  }

  async deleteCourseMaterial(id: string) {
    return this.request(`/api/upload/material/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadExamNotice(file: File, metadata?: any) {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });
    }

    return this.request('/api/upload/exam-notice', {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData,
    });
  }

  async getLecturerFiles() {
    return this.request('/api/upload/lecturer/files');
  }

  async downloadLecturerFile(filename: string) {
    return this.request(`/api/upload/lecturer/files/${filename}/download`);
  }

  async deleteLecturerFile(filename: string) {
    return this.request(`/api/upload/lecturer/files/${filename}`, {
      method: 'DELETE',
    });
  }

  // Chat endpoint
  async sendChatMessage(message: string, language?: string) {
    return this.request('/api/chat/chat', {
      method: 'POST',
      body: JSON.stringify({ message, language }),
    });
  }

  // STT endpoint
  async uploadAudioForTranscription(file: Blob, language: string) {
    const formData = new FormData();
    formData.append('audio', file, 'recording.wav');
    formData.append('language', language);

    return this.request('/api/stt/transcribe', {
      method: 'POST',
      headers: {}, // Let browser set content-type for FormData
      body: formData,
    });
  }

  // User endpoints
  async getUsers() {
    return this.request('/api/users');
  }

  async createUser(user: any) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);