import { Store } from '@/lib/types';

export async function getStores(): Promise<Store[]> {
  const response = await fetch('/api/stores');
  if (!response.ok) {
    throw new Error('Failed to fetch stores');
  }
  return response.json();
}

export async function getStore(id: string): Promise<Store | null> {
  const response = await fetch(`/api/stores/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch store');
  }
  return response.json();
} 