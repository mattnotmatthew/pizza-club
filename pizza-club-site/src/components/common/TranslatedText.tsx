/**
 * TranslatedText - Wrapper component that translates text to Chicagoian when mode is active
 * Automatically handles all text content when translation mode is enabled
 */

import React, { type ReactNode } from 'react';
import { useChicagoian } from '@/contexts/ChicagoianContext';
import { translateToChicagoian, shouldTranslate } from '@/utils/chicagoianTranslator';

interface TranslatedTextProps {
  children: ReactNode;
  /**
   * Optional flag to disable translation for specific content
   * (e.g., technical terms, proper nouns that shouldn't change)
   */
  skipTranslation?: boolean;
}

/**
 * Recursively processes React children to translate text content
 */
const processChildren = (children: ReactNode, shouldApplyTranslation: boolean): ReactNode => {
  return React.Children.map(children, (child) => {
    // Handle string children (the actual text content)
    if (typeof child === 'string') {
      if (shouldApplyTranslation && shouldTranslate(child)) {
        return translateToChicagoian(child);
      }
      return child;
    }

    // Handle number children
    if (typeof child === 'number') {
      return child;
    }

    // Handle React elements
    if (React.isValidElement(child)) {
      // Recursively process the children of this element
      const processedChildren = processChildren(
        (child.props as any)?.children, 
        shouldApplyTranslation
      );
      
      // Clone the element with processed children
      return React.cloneElement(child as React.ReactElement<any>, {
        ...(child.props as any),
        children: processedChildren,
      });
    }

    // Handle arrays of children
    if (Array.isArray(child)) {
      return processChildren(child, shouldApplyTranslation);
    }

    // Return other types as-is (null, undefined, boolean, etc.)
    return child;
  });
};

export const TranslatedText: React.FC<TranslatedTextProps> = ({ 
  children, 
  skipTranslation = false 
}) => {
  const { isChicagoianMode } = useChicagoian();
  
  // If translation is disabled or skipped, return children as-is
  const shouldApplyTranslation = isChicagoianMode && !skipTranslation;
  
  if (!shouldApplyTranslation) {
    return <>{children}</>;
  }

  // Process and translate all text content in children
  const translatedChildren = processChildren(children, shouldApplyTranslation);
  
  return <>{translatedChildren}</>;
};

/**
 * Hook version for cases where you need to translate text programmatically
 */
export const useTranslatedText = (text: string, skipTranslation = false): string => {
  const { isChicagoianMode } = useChicagoian();
  
  if (!isChicagoianMode || skipTranslation || !shouldTranslate(text)) {
    return text;
  }
  
  return translateToChicagoian(text);
};

export default TranslatedText;