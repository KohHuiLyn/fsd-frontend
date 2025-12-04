import { createApiClient } from './apiClient';

const apiClient = createApiClient();

export interface Reminder {
  id: string;
  name: string;
  notes?: string | null;
  dueAt?: string;
  dueDay?: number[];
  isActive?: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  isProxy?: boolean;
  proxy?: string | null;
}

export interface CreateReminderRequest {
  rName: string;
  notes?: string | null;
  isActive?: boolean;
  dueAt?: string | null;
  dueDay?: number[];
  isProxy?: boolean;
  proxy?: string | null;
}

export interface UpdateReminderRequest {
  name?: string;
  notes?: string | null;
  dueAt?: string | null;
  dueDay?: number[];
  isActive?: boolean;
}

interface ReminderCreateResponse {
  reminderID: string;
}

function mapReminder(apiReminder: any): Reminder {
  if (!apiReminder) {
    throw new Error('Invalid reminder payload received from API.');
  }

  return {
    id: apiReminder.id,
    name: apiReminder.name ?? apiReminder.rName ?? apiReminder.r_name,
    notes: Object.prototype.hasOwnProperty.call(apiReminder, 'notes') ? apiReminder.notes : undefined,
    dueAt: apiReminder.dueAt ?? apiReminder.due_at,
    dueDay: apiReminder.dueDay ?? apiReminder.due_day ?? apiReminder.due_days ?? undefined,
    isActive: apiReminder.isActive ?? apiReminder.is_active,
    userId: apiReminder.user_id,
    createdAt: apiReminder.created_at,
    updatedAt: apiReminder.updated_at,
    isProxy: apiReminder.is_proxy ?? apiReminder.isProxy,
    proxy: apiReminder.proxy ?? apiReminder.proxy_number ?? null,
  };
}

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export async function createReminder(payload: CreateReminderRequest): Promise<string> {
  const body: Record<string, any> = {
    rName: payload.rName,
    notes: payload.notes ?? null,
    isActive: payload.isActive ?? true,
    dueAt: payload.dueAt ?? null,
    dueDay: payload.dueDay ?? [],
    isProxy: payload.isProxy ?? false,
    proxy: payload.proxy ?? null,
  };
  console.log('body', body);
 
  const response = await apiClient.post<ReminderCreateResponse>('/reminder/reminder/v1/reminder/create', body);

  if (!response?.reminderID) {
    throw new Error('Reminder could not be created.');
  }

  return response.reminderID;
}

export async function getReminder(reminderId: string): Promise<Reminder | null> {
  const trimmedId = reminderId.trim();
  if (!trimmedId) {
    throw new Error('Reminder ID is required.');
  }

  try {
    const query = buildQuery({ id: trimmedId });
    const response = await apiClient.get<{ client: any }>(`/reminder/reminder/v1/reminder${query}`);

    if (!response?.client) {
      throw new Error('Reminder not found.');
    }

    return mapReminder(response.client);
  } catch (error: any) {
    if (typeof error?.message === 'string' && error.message.toLowerCase().includes('notfound')) {
      return null;
    }
    throw error;
  }
}

export async function getReminders(): Promise<Reminder[]> {
  try {
    const response = await apiClient.get<{ clients?: any[] }>('/reminder/reminder/v1/reminders');

    if (!response?.clients?.length) {
      return [];
    }

    return response.clients.map(mapReminder);
  } catch (error: any) {
    if (typeof error?.message === 'string' && error.message.toLowerCase().includes('notfound')) {
      return [];
    }
    throw error;
  }
}

export async function getDueReminders(windowSec?: number): Promise<Reminder[]> {
  const query = buildQuery({ windowSec });
  try {
    const response = await apiClient.get<{ reminders?: any[] }>(`/reminder/reminder/v1/reminders/due${query}`);

    if (!response?.reminders?.length) {
      return [];
    }

    return response.reminders.map(mapReminder);
  } catch (error: any) {
    if (typeof error?.message === 'string' && error.message.toLowerCase().includes('notfound')) {
      return [];
    }
    throw error;
  }
}

export async function updateReminder(reminderId: string, updates: UpdateReminderRequest): Promise<Reminder> {
  const trimmedId = reminderId.trim();
  if (!trimmedId) {
    throw new Error('Reminder ID is required.');
  }

  const body: Record<string, any> = {};

  if (updates.name !== undefined) {
    body.name = updates.name;
  }
  if (updates.notes !== undefined) {
    body.notes = updates.notes;
  }
  if (updates.dueAt !== undefined) {
    body.dueAt = updates.dueAt;
  }
  if (updates.dueDay !== undefined) {
    body.dueDay = updates.dueDay;
  }
  if (updates.isActive !== undefined) {
    body.isActive = updates.isActive;
  }

  const query = buildQuery({ id: trimmedId });
  const response = await apiClient.put<{ client: any }>(`/reminder/reminder/v1/reminder${query}`, body);

  if (!response?.client) {
    throw new Error('Reminder could not be updated.');
  }

  return mapReminder(response.client);
}

export async function deleteReminder(reminderId: string): Promise<string> {
  const trimmedId = reminderId.trim();
  if (!trimmedId) {
    throw new Error('Reminder ID is required.');
  }

  const response = await apiClient.delete<{ reminderIDRes?: string }>(`/reminder/reminder/v1/reminder/${trimmedId}`);

  if (!response?.reminderIDRes) {
    throw new Error('Reminder could not be deleted.');
  }

  return response.reminderIDRes;
}


