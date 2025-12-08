/**
 * Infographics Service with Draft/Publish Workflow
 *
 * Workflow:
 * 1. Drafts are stored in localStorage (client-side only)
 * 2. Publishing sends to MySQL database with static HTML generation
 * 3. Published infographics are served from database
 * 4. Editing published infographics pulls from database back to localStorage
 */

import type {
  Infographic,
  CreateInfographicInput,
  InfographicWithData
} from '@/types/infographics';
import { generateStaticHTML } from '@/utils/infographicExport';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const DRAFTS_STORAGE_KEY = 'infographic-drafts';
const API_TOKEN = import.meta.env.VITE_UPLOAD_API_TOKEN || '';

/**
 * Draft Management (localStorage)
 */
export const draftService = {
  /**
   * Get all drafts from localStorage
   */
  getDrafts(): Infographic[] {
    const stored = localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (!stored) return [];

    try {
      const drafts = JSON.parse(stored) as Infographic[];
      return drafts.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (e) {
      console.error('Failed to parse drafts:', e);
      return [];
    }
  },

  /**
   * Get draft by ID
   */
  getDraft(id: string): Infographic | undefined {
    const drafts = this.getDrafts();
    return drafts.find(d => d.id === id);
  },

  /**
   * Save draft to localStorage
   */
  saveDraft(draft: Infographic | CreateInfographicInput): Infographic {
    const drafts = this.getDrafts();
    const now = new Date().toISOString();

    let savedDraft: Infographic;

    if ('id' in draft) {
      // Update existing draft
      const index = drafts.findIndex(d => d.id === draft.id);
      savedDraft = {
        ...draft,
        status: 'draft',
        updatedAt: now
      } as Infographic;

      if (index >= 0) {
        drafts[index] = savedDraft;
      } else {
        drafts.push(savedDraft);
      }
    } else {
      // Create new draft
      savedDraft = {
        ...draft,
        id: `draft-${Date.now()}`,
        status: 'draft',
        createdAt: now,
        updatedAt: now
      } as Infographic;
      drafts.push(savedDraft);
    }

    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    return savedDraft;
  },

  /**
   * Delete draft from localStorage
   */
  deleteDraft(id: string): void {
    const drafts = this.getDrafts();
    const filtered = drafts.filter(d => d.id !== id);
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(filtered));
  },

  /**
   * Clear all drafts
   */
  clearAllDrafts(): void {
    localStorage.removeItem(DRAFTS_STORAGE_KEY);
  }
};

/**
 * Published Infographics (MySQL via API)
 */
export const publishedService = {
  /**
   * Get all published infographics
   */
  async getPublished(options?: {
    restaurantId?: string;
    includeStatic?: boolean;
  }): Promise<Infographic[]> {
    const params = new URLSearchParams();
    if (options?.restaurantId) {
      params.append('restaurant_id', options.restaurantId);
    }
    if (options?.includeStatic) {
      params.append('include_static', 'true');
    }

    const url = `${API_BASE_URL}/infographics${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch published infographics: ${response.statusText}`);
    }

    const result = await response.json();
    // Unwrap API response which has format: { success: true, data: [...] }
    return result.data || result;
  },

  /**
   * Get published infographic by ID with full data
   */
  async getPublishedWithData(id: string): Promise<InfographicWithData> {
    const url = `${API_BASE_URL}/infographics?id=${id}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch infographic: ${response.statusText}`);
    }

    const result = await response.json();
    // Unwrap API response which has format: { success: true, data: {...} }
    return result.data || result;
  },

  /**
   * Publish an infographic
   * Generates static HTML and saves to database
   */
  async publish(data: InfographicWithData): Promise<{ id: string }> {
    // Generate static HTML
    const staticHtml = generateStaticHTML(data);
    console.log('[Publish] Generated static HTML length:', staticHtml.length);
    console.log('[Publish] Static HTML preview:', staticHtml.substring(0, 200));

    // Prepare payload
    const payload = {
      id: data.id,
      restaurantId: data.restaurantId,
      visitDate: data.visitDate,
      content: data.content,
      staticHtml: staticHtml,
      createdBy: data.createdBy
    };

    console.log('[Publish] Payload keys:', Object.keys(payload));
    console.log('[Publish] StaticHtml field included:', 'staticHtml' in payload);

    const response = await fetch(`${API_BASE_URL}/infographics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    console.log('[Publish] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json();
      console.error('[Publish] Error response:', error);
      throw new Error(error.error || 'Failed to publish infographic');
    }

    const result = await response.json();
    console.log('[Publish] Success response:', result);

    // Remove from drafts if it was a draft
    // Do this BEFORE returning so it always executes
    if (data.id.startsWith('draft-')) {
      draftService.deleteDraft(data.id);
    }

    // Unwrap the API response which has format: { success: true, data: {...} }
    return result.data || result;
  },

  /**
   * Update a published infographic
   * Re-generates static HTML
   */
  async update(data: InfographicWithData): Promise<void> {
    // Generate new static HTML
    const staticHtml = generateStaticHTML(data);

    const payload = {
      id: data.id,
      content: data.content,
      staticHtml: staticHtml
    };

    const response = await fetch(`${API_BASE_URL}/infographics`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update infographic');
    }
  },

  /**
   * Delete a published infographic
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/infographics?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete infographic');
    }
  },

  /**
   * Load published infographic for editing
   * Pulls from database and saves to localStorage as draft
   */
  async loadForEditing(id: string): Promise<Infographic> {
    const published = await this.getPublishedWithData(id);

    // Convert to draft and save to localStorage
    const draft: Infographic = {
      id: `draft-edit-${published.id}`,
      restaurantId: published.restaurantId,
      visitDate: published.visitDate,
      status: 'draft',
      content: published.content,
      createdAt: published.createdAt,
      updatedAt: new Date().toISOString(),
      createdBy: published.createdBy,
      // Store original ID so we can update instead of create on re-publish
      originalPublishedId: published.id
    } as Infographic & { originalPublishedId: string };

    return draftService.saveDraft(draft);
  }
};

/**
 * Combined service for working with infographics
 */
export const infographicsService = {
  drafts: draftService,
  published: publishedService,

  /**
   * Get all infographics (drafts + published)
   */
  async getAll(): Promise<Infographic[]> {
    const drafts = draftService.getDrafts();
    const published = await publishedService.getPublished();

    // Combine and sort by update time
    return [...drafts, ...published].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  /**
   * Get infographic by ID (checks drafts first, then published)
   */
  async getById(id: string): Promise<Infographic | undefined> {
    // Check drafts first
    const draft = draftService.getDraft(id);
    if (draft) return draft;

    // Then check published
    try {
      return await publishedService.getPublishedWithData(id);
    } catch (e) {
      return undefined;
    }
  }
};

export default infographicsService;
