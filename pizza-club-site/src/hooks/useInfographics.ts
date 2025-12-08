/**
 * Infographics Hook - Updated for Draft/Publish Workflow
 *
 * Workflow:
 * - Drafts stored in localStorage
 * - Published infographics saved to MySQL with static HTML
 * - Can edit published by loading back to draft
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import infographicsService from '@/services/infographicsService';
import type {
  Infographic,
  CreateInfographicInput,
  InfographicWithData
} from '@/types/infographics';

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

interface UseInfographicsReturn {
  // Update draft content without saving
  updateDraftContent: (draft: Partial<CreateInfographicInput>) => void;
  infographics: Infographic[];
  drafts: Infographic[];
  published: Infographic[];
  loading: boolean;
  error: string | null;
  // Draft operations
  saveDraft: (draft: Infographic | CreateInfographicInput) => Infographic;
  loadDraft: (id?: string) => Infographic | null;
  deleteDraft: (id: string) => void;
  clearDraft: () => void;
  // Publish operations
  publishInfographic: (data: InfographicWithData) => Promise<{ id: string }>;
  updatePublished: (data: InfographicWithData) => Promise<void>;
  deletePublished: (id: string) => Promise<void>;
  loadPublishedForEdit: (id: string) => Promise<Infographic>;
  // Auto-save
  enableAutoSave: (draft: Partial<CreateInfographicInput>) => void;
  disableAutoSave: () => void;
  // Reload data
  reload: () => Promise<void>;
}

export function useInfographics(): UseInfographicsReturn {
  const [infographics, setInfographics] = useState<Infographic[]>([]);
  const [drafts, setDrafts] = useState<Infographic[]>([]);
  const [published, setPublished] = useState<Infographic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const draftRef = useRef<Partial<CreateInfographicInput> | null>(null);

  // Load all infographics on mount
  useEffect(() => {
    loadAllInfographics();
  }, []);

  const loadAllInfographics = async () => {
    try {
      setLoading(true);

      // Load drafts from localStorage
      const localDrafts = infographicsService.drafts.getDrafts();
      setDrafts(localDrafts);

      // Load published from API
      try {
        const publishedData = await infographicsService.published.getPublished();
        setPublished(publishedData);
      } catch (apiError) {
        console.error('Failed to load published infographics:', apiError);
        // Continue with just drafts if API fails
        setPublished([]);
      }

      // Combine for "all" list
      const all = await infographicsService.getAll();
      setInfographics(all);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load infographics');
    } finally {
      setLoading(false);
    }
  };

  // Reload data
  const reload = useCallback(async () => {
    await loadAllInfographics();
  }, []);

  // Save draft to localStorage
  const saveDraft = useCallback((draft: Infographic | CreateInfographicInput): Infographic => {
    const saved = infographicsService.drafts.saveDraft(draft);
    setDrafts(infographicsService.drafts.getDrafts());
    setInfographics(prev => {
      const filtered = prev.filter(ig => ig.id !== saved.id);
      return [saved, ...filtered].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
    return saved;
  }, []);

  // Load draft from localStorage
  const loadDraft = useCallback((id?: string): Infographic | null => {
    if (id) {
      return infographicsService.drafts.getDraft(id) || null;
    }
    // Return most recent draft
    const allDrafts = infographicsService.drafts.getDrafts();
    return allDrafts.length > 0 ? allDrafts[0] : null;
  }, []);

  // Delete draft from localStorage
  const deleteDraft = useCallback((id: string) => {
    infographicsService.drafts.deleteDraft(id);
    setDrafts(infographicsService.drafts.getDrafts());
    setInfographics(prev => prev.filter(ig => ig.id !== id));
  }, []);

  // Clear current draft (for backward compatibility)
  const clearDraft = useCallback(() => {
    const allDrafts = infographicsService.drafts.getDrafts();
    if (allDrafts.length > 0) {
      deleteDraft(allDrafts[0].id);
    }
  }, [deleteDraft]);

  // Publish infographic (with static HTML generation)
  const publishInfographic = useCallback(async (data: InfographicWithData): Promise<{ id: string }> => {
    try {
      const result = await infographicsService.published.publish(data);

      // Refresh published list
      const publishedData = await infographicsService.published.getPublished();
      setPublished(publishedData);

      // Remove from drafts if it was a draft
      if (data.id.startsWith('draft-')) {
        setDrafts(infographicsService.drafts.getDrafts());
      }

      // Reload all
      await reload();

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to publish infographic';
      setError(message);
      throw new Error(message);
    }
  }, [reload]);

  // Update published infographic
  const updatePublished = useCallback(async (data: InfographicWithData): Promise<void> => {
    try {
      await infographicsService.published.update(data);

      // Refresh published list
      const publishedData = await infographicsService.published.getPublished();
      setPublished(publishedData);

      await reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update infographic';
      setError(message);
      throw new Error(message);
    }
  }, [reload]);

  // Delete published infographic
  const deletePublished = useCallback(async (id: string): Promise<void> => {
    try {
      await infographicsService.published.delete(id);
      setPublished(prev => prev.filter(ig => ig.id !== id));
      setInfographics(prev => prev.filter(ig => ig.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete infographic';
      setError(message);
      throw new Error(message);
    }
  }, []);

  // Load published infographic for editing
  const loadPublishedForEdit = useCallback(async (id: string): Promise<Infographic> => {
    try {
      const draft = await infographicsService.published.loadForEditing(id);
      setDrafts(infographicsService.drafts.getDrafts());
      return draft;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load for editing';
      setError(message);
      throw new Error(message);
    }
  }, []);

  // Auto-save functionality (for drafts only)
  const enableAutoSave = useCallback((draft: Partial<CreateInfographicInput>) => {
    // Only set up the interval if not already running
    if (!autoSaveIntervalRef.current) {
      // Set up interval for auto-save (don't save immediately)
      autoSaveIntervalRef.current = setInterval(() => {
        if (draftRef.current) {
          saveDraft(draftRef.current as CreateInfographicInput);
          console.log('Auto-saved draft at', new Date().toLocaleTimeString());
        }
      }, AUTO_SAVE_INTERVAL);
    }

    // Always update the draft reference so the interval saves the latest version
    draftRef.current = draft;
  }, [saveDraft]);

  const disableAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
    draftRef.current = null;
  }, []);

  // Update draft content without saving (just updates the ref for next auto-save)
  const updateDraftContent = useCallback((draft: Partial<CreateInfographicInput>) => {
    draftRef.current = draft;
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
    drafts,
    published,
    loading,
    error,
    saveDraft,
    loadDraft,
    deleteDraft,
    clearDraft,
    publishInfographic,
    updatePublished,
    deletePublished,
    loadPublishedForEdit,
    enableAutoSave,
    disableAutoSave,
    updateDraftContent,
    reload
  };
}
