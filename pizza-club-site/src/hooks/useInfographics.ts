import { useState, useEffect, useCallback, useRef } from 'react';
import { dataService } from '@/services/data';
import type { Infographic, CreateInfographicInput, UpdateInfographicInput } from '@/types/infographics';

const DRAFT_STORAGE_KEY = 'infographic-draft';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

interface UseInfographicsReturn {
  infographics: Infographic[];
  loading: boolean;
  error: string | null;
  createInfographic: (input: CreateInfographicInput) => Promise<Infographic>;
  updateInfographic: (id: string, input: UpdateInfographicInput) => Promise<Infographic>;
  deleteInfographic: (id: string) => Promise<void>;
  publishInfographic: (id: string) => Promise<Infographic>;
  // Draft management
  loadDraft: () => Partial<CreateInfographicInput> | null;
  saveDraft: (draft: Partial<CreateInfographicInput>) => void;
  clearDraft: () => void;
  // Auto-save
  enableAutoSave: (draft: Partial<CreateInfographicInput>) => void;
  disableAutoSave: () => void;
}

export function useInfographics(): UseInfographicsReturn {
  const [infographics, setInfographics] = useState<Infographic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const draftRef = useRef<Partial<CreateInfographicInput> | null>(null);

  // Load infographics on mount
  useEffect(() => {
    loadInfographics();
  }, []);

  const loadInfographics = async () => {
    try {
      setLoading(true);
      const data = await dataService.getInfographics();
      setInfographics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load infographics');
    } finally {
      setLoading(false);
    }
  };

  // Create new infographic
  const createInfographic = useCallback(async (input: CreateInfographicInput): Promise<Infographic> => {
    try {
      const newInfographic = await dataService.saveInfographic(input);
      setInfographics(prev => [newInfographic, ...prev]);
      clearDraft(); // Clear draft after successful save
      return newInfographic;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create infographic';
      setError(message);
      throw new Error(message);
    }
  }, []);

  // Update existing infographic
  const updateInfographic = useCallback(async (id: string, input: UpdateInfographicInput): Promise<Infographic> => {
    try {
      const updated = await dataService.saveInfographic({ ...input, id });
      setInfographics(prev => prev.map(ig => ig.id === id ? updated : ig));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update infographic';
      setError(message);
      throw new Error(message);
    }
  }, []);

  // Delete infographic
  const deleteInfographic = useCallback(async (id: string): Promise<void> => {
    try {
      await dataService.deleteInfographic(id);
      setInfographics(prev => prev.filter(ig => ig.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete infographic';
      setError(message);
      throw new Error(message);
    }
  }, []);

  // Publish infographic
  const publishInfographic = useCallback(async (id: string): Promise<Infographic> => {
    try {
      const published = await dataService.publishInfographic(id);
      setInfographics(prev => prev.map(ig => ig.id === id ? published : ig));
      return published;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to publish infographic';
      setError(message);
      throw new Error(message);
    }
  }, []);

  // Draft management functions
  const loadDraft = useCallback((): Partial<CreateInfographicInput> | null => {
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        const draft = JSON.parse(stored);
        draftRef.current = draft;
        return draft;
      }
    } catch (err) {
      console.error('Failed to load draft:', err);
    }
    return null;
  }, []);

  const saveDraft = useCallback((draft: Partial<CreateInfographicInput>) => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      draftRef.current = draft;
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      draftRef.current = null;
    } catch (err) {
      console.error('Failed to clear draft:', err);
    }
  }, []);

  // Auto-save functionality
  const enableAutoSave = useCallback((draft: Partial<CreateInfographicInput>) => {
    // Clear any existing interval
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    // Save immediately
    saveDraft(draft);

    // Set up interval for auto-save
    autoSaveIntervalRef.current = setInterval(() => {
      if (draftRef.current) {
        saveDraft(draftRef.current);
        console.log('Auto-saved draft at', new Date().toLocaleTimeString());
      }
    }, AUTO_SAVE_INTERVAL);
  }, [saveDraft]);

  const disableAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, []);

  return {
    infographics,
    loading,
    error,
    createInfographic,
    updateInfographic,
    deleteInfographic,
    publishInfographic,
    loadDraft,
    saveDraft,
    clearDraft,
    enableAutoSave,
    disableAutoSave
  };
}