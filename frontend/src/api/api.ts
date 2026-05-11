const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const getJson = async (response: Response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const apiRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...getAuthHeaders()
    }
  });

  const data = await getJson(response);
  if (!response.ok) {
    const message = data?.error || response.statusText || 'API request failed';
    throw new ApiError(message, response.status, data);
  }

  return data as T;
};

export type AuthResponse<T> = {
  message: string;
  token?: string;
  user?: T;
  student?: T;
  lecturer?: T;
};

export type LoginResult<T> = AuthResponse<T>;

export const loginStudent = async (email: string, password: string): Promise<LoginResult<any>> => {
  return apiRequest('/api/auth/student/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

export const loginLecturer = async (email: string, password: string): Promise<LoginResult<any>> => {
  return apiRequest('/api/auth/lecturer/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

export const registerLecturer = async (
  departmentHeadEmail: string,
  lecturerName: string,
  lecturerEmail: string,
  lecturerDepartment: string,
  lecturerPassword: string
): Promise<AuthResponse<any>> => {
  return apiRequest('/api/auth/lecturer/register', {
    method: 'POST',
    body: JSON.stringify({
      departmentHeadEmail,
      lecturerName,
      lecturerEmail,
      lecturerDepartment,
      lecturerPassword
    })
  });
};

export const loginDepartmentHead = async (email: string, password: string): Promise<LoginResult<any>> => {
  return apiRequest('/api/auth/department-head/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

export const registerStudent = async (payload: {
  name: string;
  email: string;
  password: string;
  batchYear: string | number;
  department: string;
}): Promise<AuthResponse<any>> => {
  return apiRequest<AuthResponse<any>>('/api/auth/student/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const getMaterials = async () => {
  return apiRequest<{
    materials: Array<any>;
  }>('/api/upload/material');
};

export const fetchReminders = async () => {
  return apiRequest<{
    message: string;
    reminders: Array<any>;
    total: number;
  }>('/api/reminders/student');
};

export const createReminder = async (payload: {
  title: string;
  description?: string;
  scheduleId?: number;
  reminderType?: string;
  reminderTime?: string;
  repeatOption?: string;
}) => {
  return apiRequest<{
    message: string;
    reminder: any;
  }>('/api/reminders/student', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const updateReminder = async (id: string, payload: Record<string, any>) => {
  return apiRequest<{
    message: string;
    reminder: any;
  }>(`/api/reminders/student/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
};

export const deleteReminder = async (id: string) => {
  return apiRequest<{
    message: string;
    reminder: any;
  }>(`/api/reminders/student/${id}`, {
    method: 'DELETE'
  });
};

export const fetchSchedules = async (query: Record<string, string | number | undefined> = {}) => {
  const queryString = new URLSearchParams(
    Object.entries(query).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  return apiRequest<{
    schedules: Array<any>;
    total: number;
  }>(`/api/schedules${queryString ? `?${queryString}` : ''}`);
};

export const sendChatMessage = async (payload: {
  message: string;
  language?: string;
}) => {
  return apiRequest<{
    message: string;
    response: string;
  }>('/api/chat/chat', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};
