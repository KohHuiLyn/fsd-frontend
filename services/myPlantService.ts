import { createApiClient } from './apiClient';

const apiClient = createApiClient();

export interface UserPlant {
  id: string;
  userId?: string;
  name: string;
  plantName?: string;
  species?: string | null;
  location?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserPlantPayload {
  plantName: string;
  species?: string | null;
  location?: string | null;
  notes?: string | null;
  imageFile?: {
    uri: string;
    type: string;
    name: string;
  } | null;
}

export interface UpdateUserPlantPayload {
  plantName?: string;
  species?: string | null;
  location?: string | null;
  notes?: string | null;
}

interface CreatePlantResponse {
  plantID: string;
}

function mapUserPlant(apiPlant: any): UserPlant {
  if (!apiPlant) {
    throw new Error('Invalid plant payload received from API.');
  }

  const resolvedName = apiPlant.plantName ?? apiPlant.plant_name ?? apiPlant.name ?? 'Unnamed plant';

  return {
    id: apiPlant.id,
    userId: apiPlant.userID ?? apiPlant.user_id ?? undefined,
    name: resolvedName,
    plantName: resolvedName,
    species: apiPlant.species ?? null,
    location: apiPlant.location ?? null,
    notes: apiPlant.notes ?? null,
    imageUrl: apiPlant.image_url ?? apiPlant.imageUrl ?? apiPlant.s3_id ?? apiPlant.s3Id ?? null,
    createdAt: apiPlant.createdAt ?? apiPlant.created_at,
    updatedAt: apiPlant.updatedAt ?? apiPlant.updated_at,
  };
}

function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
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

export async function createUserPlant(payload: CreateUserPlantPayload): Promise<string> {
  const formData = new FormData();

  formData.append('plantName', payload.plantName);
//   if (payload.species !== undefined) {
//     formData.append('species', payload.species ?? '');
//   }
//   if (payload.location !== undefined) {
//     formData.append('location', payload.location ?? '');
//   }
  if (payload.notes !== undefined) {
    formData.append('notes', payload.notes ?? '');
  }

  if (payload.imageFile) {
    formData.append('file', payload.imageFile as any);
  }

  console.log('formData', JSON.stringify(formData));
  const response = await apiClient.post<CreatePlantResponse>('/user-plant/v1/userPlant/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  } as any);

  if (!response?.plantID) {
    throw new Error('Plant could not be created.');
  }

  return response.plantID;
}

export async function getUserPlant(plantId: string): Promise<UserPlant> {
  const trimmedId = plantId.trim();
  if (!trimmedId) {
    throw new Error('Plant ID is required.');
  }

  const query = buildQueryString({ id: trimmedId });
  const response = await apiClient.get<{ plant: any }>(`/user-plant/v1/userPlant${query}`);

  if (!response?.plant) {
    throw new Error('Plant not found.');
  }

  return mapUserPlant(response.plant);
}

export async function getUserPlants(): Promise<UserPlant[]> {
  const response = await apiClient.get<{ plants?: any[] }>('/user-plant/v1/userPlants');
    console.log('response', JSON.stringify(response));
  if (!response?.plants?.length) {
    return [];
  }

  return response.plants.map(mapUserPlant);
}

export interface SearchUserPlantsParams {
  name?: string;
  species?: string;
  location?: string;
  [key: string]: string | undefined;
}

export async function searchUserPlants(params: SearchUserPlantsParams): Promise<UserPlant[]> {
  const query = buildQueryString(params);
  const response = await apiClient.get<{ plants?: any[] }>(`/user-plant/search${query}`);

  if (!response?.plants?.length) {
    return [];
  }

  return response.plants.map(mapUserPlant);
}

export async function updateUserPlant(plantId: string, updates: UpdateUserPlantPayload): Promise<UserPlant> {
  const trimmedId = plantId.trim();
  if (!trimmedId) {
    throw new Error('Plant ID is required.');
  }

  const body: Record<string, any> = {};

  if (updates.plantName !== undefined) {
    body.plantName = updates.plantName;
  }
  if (updates.species !== undefined) {
    body.species = updates.species;
  }
  if (updates.location !== undefined) {
    body.location = updates.location;
  }
  if (updates.notes !== undefined) {
    body.notes = updates.notes;
  }

  const query = buildQueryString({ id: trimmedId });
  const response = await apiClient.put<{ plant: any }>(`/user-plant/v1/userPlant${query}`, body);

  if (!response?.plant) {
    throw new Error('Plant could not be updated.');
  }

  return mapUserPlant(response.plant);
}

export async function deleteUserPlant(plantId: string): Promise<string> {
  const trimmedId = plantId.trim();
  if (!trimmedId) {
    throw new Error('Plant ID is required.');
  }

  const query = buildQueryString({ id: trimmedId });
  const response = await apiClient.delete<{ plantID?: string }>(`/user-plant/v1/userPlant${query}`);

  if (!response?.plantID) {
    throw new Error('Plant could not be deleted.');
  }

  return response.plantID;
}

