'use client';

import { getUserSavedToolIdsAction } from '@/app/actions/userActions';

let savedToolIdsSet = new Set<string>();
let isLoaded = false;
let isLoading = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export async function initSavedTools() {
  if (isLoaded || isLoading) return;
  isLoading = true;
  try {
    const ids = await getUserSavedToolIdsAction();
    savedToolIdsSet = new Set(ids);
    isLoaded = true;
    notify();
  } catch {
    // silent fail
  } finally {
    isLoading = false;
  }
}

export function isToolIdSaved(toolId: string): boolean {
  return savedToolIdsSet.has(toolId);
}

export function subscribeToSavedTools(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setToolSavedState(toolId: string, saved: boolean) {
  if (saved) {
    savedToolIdsSet.add(toolId);
  } else {
    savedToolIdsSet.delete(toolId);
  }
  notify();
}
