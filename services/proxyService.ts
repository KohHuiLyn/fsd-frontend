import { createApiClient } from './apiClient';

const apiClient = createApiClient();

export interface ProxyContact {
  id: string;
  name: string;
  phoneNumber?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProxyRequest {
  name: string;
  phoneNumber?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  [key: string]: any;
}

export interface UpdateProxyRequest {
  name?: string;
  phoneNumber?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  [key: string]: any;
}

interface CreateProxyResponse {
  proxyID: string;
}

function mapProxy(apiProxy: any): ProxyContact {
  if (!apiProxy) {
    throw new Error('Invalid proxy payload received from API.');
  }

  return {
    id: apiProxy.id,
    name: apiProxy.name,
    phoneNumber: apiProxy.phone_number ?? null,
    startDate: apiProxy.startDate ?? apiProxy.start_date ?? null,
    endDate: apiProxy.endDate ?? apiProxy.end_date ?? null,
    createdAt: apiProxy.created_at ?? apiProxy.createdAt,
    updatedAt: apiProxy.updated_at ?? apiProxy.updatedAt,
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

export async function createProxy(payload: CreateProxyRequest): Promise<string> {
    console.log('payload', JSON.stringify(payload));
  const response = await apiClient.post<CreateProxyResponse>('/proxy/v1/proxy/create', payload);

  if (!response?.proxyID) {
    throw new Error('Proxy could not be created.');
  }

  return response.proxyID;
}

export async function getProxy(proxyId: string): Promise<ProxyContact | null> {
  const trimmedId = proxyId.trim();
  if (!trimmedId) {
    throw new Error('Proxy ID is required.');
  }

  try {
    const response = await apiClient.get<{ proxy?: any }>(`/proxy/v1/proxy/${trimmedId}`);

    if (!response?.proxy) {
      throw new Error('Proxy not found.');
    }

    return mapProxy(response.proxy);
  } catch (error: any) {
    if (typeof error?.message === 'string' && error.message.toLowerCase().includes('notfound')) {
      return null;
    }
    throw error;
  }
}

export async function getProxies(): Promise<ProxyContact[]> {
  try {
    const response = await apiClient.get<{ proxys?: any[] }>('/proxy/v1/proxys');
    console.log('response', JSON.stringify(response));

    if (!response?.proxys?.length) {
      return [];
    }

    return response.proxys.map(mapProxy);
  } catch (error: any) {
    if (typeof error?.message === 'string' && error.message.toLowerCase().includes('notfound')) {
      return [];
    }
    throw error;
  }
}

export interface SearchProxyParams {
  [key: string]: string | undefined;
}

export async function searchProxies(params: SearchProxyParams): Promise<ProxyContact[]> {
  const query = buildQueryString(params);

  try {
    const response = await apiClient.get<{ proxys?: any[] }>(`/proxy/v1/proxy/search${query}`);

    if (!response?.proxys?.length) {
      return [];
    }

    return response.proxys.map(mapProxy);
  } catch (error: any) {
    if (typeof error?.message === 'string' && error.message.toLowerCase().includes('notfound')) {
      return [];
    }
    throw error;
  }
}

export async function updateProxy(proxyId: string, updates: UpdateProxyRequest): Promise<ProxyContact> {
  const trimmedId = proxyId.trim();
  if (!trimmedId) {
    throw new Error('Proxy ID is required.');
  }

  console.log('updates', JSON.stringify(updates));
  const response = await apiClient.put<{ proxy?: any }>(`/proxy/v1/proxy/${trimmedId}`, updates);

  if (!response?.proxy) {
    throw new Error('Proxy could not be updated.');
  }

  return mapProxy(response.proxy);
}

export async function deleteProxy(proxyId: string): Promise<string> {
  const trimmedId = proxyId.trim();
  if (!trimmedId) {
    throw new Error('Proxy ID is required.');
  }

  const response = await apiClient.delete<{ proxyID?: string }>(`/proxy/v1/proxy/${trimmedId}`);

  if (!response?.proxyID) {
    throw new Error('Proxy could not be deleted.');
  }

  return response.proxyID;
}

