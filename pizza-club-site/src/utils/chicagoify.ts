/**
 * Chicagoify - Transforms text into thick Chicago dialect
 *
 * Features:
 * - TH-stopping (the → da, this → dis, etc.)
 * - Chicago vowel shifts
 * - Local slang and expressions
 * - Tavern-style pizza pride (deep dish shade)
 * - Random phrase injections
 */

// Direct word replacements (case-insensitive matching, preserves original case)
const WORD_REPLACEMENTS: Record<string, string> = {
  // TH-stopping
  'the': 'da',
  'this': 'dis',
  'that': 'dat',
  'these': 'dese',
  'those': 'dose',
  'there': 'dere',
  'their': 'dere',
  "there's": "dere's",
  'them': 'dem',
  'they': 'dey',
  "they're": "dey're",
  'with': 'wit',
  'think': 'tink',
  'thing': 'ting',
  'things': 'tings',
  'three': 'tree',
  'through': 'tru',
  'throw': 'trow',
  'thanks': 'tanks',
  'nothing': 'nuttin',
  'something': 'someting',
  'anything': 'anyting',
  'everything': 'everyting',
  'other': 'udder',
  'another': 'anudder',
  'brother': 'brudder',
  'mother': 'mudder',
  'father': 'fadder',
  'whether': 'wedder',
  'weather': 'wedder',
  'together': 'togedder',
  'rather': 'radder',

  // Chicago pronunciations
  'for': 'fer',
  'probably': 'prolly',

  // Chicago vocab
  'soda': 'pop',
  'sneakers': 'gym shoes',
  'tennis shoes': 'gym shoes',
  'restroom': 'washroom',
  'bathroom': 'washroom',
  'movies': 'da show',
  'movie': 'da show',
  'highway': 'expressway',
  'alley': 'gangway',
  'hundred': 'hunnert',
  'sandwich': 'sammich',
  'sandwiches': 'sammiches',
  'friend': 'buddy',
  'friends': 'buddies',
  'people': 'folks',
  'everyone': 'everybody',

  // Chicago understatement (very important culturally)
  'awesome': 'real nice',
  'amazing': 'not bad',
  'incredible': 'pretty good',
  'excellent': 'solid',
  'fantastic': 'real good',
  'wonderful': 'real nice',
  'absolutely': 'yeah',
  'definitely': 'prolly',
  'very': 'real',
  'really': 'real',

  // Numbers
  'thirty': 'tirty',
  'third': 'tird',
  'thirteen': 'tirteen',
  'thousand': 'tousand',
};

// Phrase replacements (order matters - longer phrases first)
const PHRASE_REPLACEMENTS: [RegExp, string][] = [
  // Deep dish shade (tavern-style pride)
  [/deep dish pizza/gi, 'dat tourist casserole'],
  [/deep dish/gi, 'dat tourist casserole'],
  [/deep-dish/gi, 'dat tourist casserole'],

  // Tavern style pride
  [/thin crust/gi, 'real Chicago tavern-style'],
  [/tavern style/gi, 'proper tavern-style, party cut'],
  [/tavern-style/gi, 'proper tavern-style, party cut'],
  [/square cut/gi, 'party cut, da way it should be'],

  // Pizza-specific
  [/pizza places/gi, 'pizza joints'],
  [/pizza place/gi, 'pizza joint'],
  [/pizza restaurant/gi, 'pizza joint'],
  [/pizza restaurants/gi, 'pizza joints'],
  [/slice of pizza/gi, 'slice a pizza'],

  // Chicago geography
  [/lake michigan/gi, 'Da Lake'],
  [/Lake Michigan/g, 'Da Lake'],
  [/downtown chicago/gi, 'Da Loop'],
  [/downtown/gi, 'da Loop'],
  [/north side/gi, "nort' side"],
  [/south side/gi, "sout' side"],
  [/the city/gi, 'da city'],
  [/the neighborhood/gi, 'da neighborhood'],
  [/the area/gi, 'da area'],
  [/across Chicagoland/gi, 'all over da Chicagoland area'],

  // Highways (never use numbers)
  [/I-90\/94/gi, 'Da Dan Ryan'],
  [/I-90/gi, 'Da Kennedy'],
  [/I-94/gi, 'Da Dan Ryan'],
  [/I-290/gi, 'Da Eisenhower'],
  [/I-55/gi, 'Da Stevenson'],
  [/I-88/gi, 'Da Reagan'],
  [/lake shore drive/gi, 'LSD'],
  [/Lake Shore Drive/g, 'LSD'],

  // Common expressions
  [/a few/gi, 'a couple two tree'],
  [/did you eat/gi, 'jeet'],
  [/Did you eat/g, 'Jeet'],
  [/you guys/gi, 'youse guys'],
  [/You guys/g, 'Youse guys'],
  [/you know/gi, 'ya know'],
  [/going to/gi, 'gonna'],
  [/want to/gi, 'wanna'],
  [/got to/gi, 'gotta'],
  [/kind of/gi, 'kinda'],
  [/sort of/gi, 'sorta'],
  [/welcome to/gi, 'hey, welcome to'],

  // Club-specific
  [/Greater Chicagoland Pizza Club/gi, 'Da Greater Chicagoland Pizza Club'],
  [/Greater Chicagoland/gi, 'Da Greater Chicagoland'],
  [/club members/gi, 'da club members'],
  [/pizza lovers/gi, 'pizza folks'],
  [/passionate pizza/gi, 'real serious pizza'],

  // Chicago attitude phrases
  [/what matters most/gi, 'da ting is'],
  [/the point is/gi, 'look, da ting is'],
  [/point is/gi, 'look'],
  [/let's be real/gi, "let's be honest here"],
  [/to be honest/gi, 'ta be honest witcha'],
  [/in my opinion/gi, 'way I see it'],

  // Grammar shifts - "said" to "goes"
  [/\bhe said\b/gi, 'he goes'],
  [/\bshe said\b/gi, 'she goes'],
  [/\bthey said\b/gi, 'dey go'],
  [/\bI said\b/gi, 'I go'],
];

// Random suffixes to occasionally append to sentences
const RANDOM_SUFFIXES = [
  ', ya know',
  ', er whatever',
  ', real nice',
  ", I'm just sayin'",
  ', over by dere',
  ', no big deal',
  ', know what I mean',
  ', but hey',
  ', what can ya do',
  ", dat's just how it is",
  ', it is what it is',
  ', not fer nuttin',
];

// Probability of adding a random suffix (0-1)
const SUFFIX_PROBABILITY = 0.08;

/**
 * Preserves the case pattern of the original word when replacing
 */
function preserveCase(original: string, replacement: string): string {
  if (original === original.toUpperCase()) {
    return replacement.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement.toLowerCase();
}

/**
 * Applies word-level replacements
 */
function replaceWords(text: string): string {
  let result = text;

  for (const [original, replacement] of Object.entries(WORD_REPLACEMENTS)) {
    // Create regex that matches whole words only, case-insensitive
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    result = result.replace(regex, (match) => preserveCase(match, replacement));
  }

  return result;
}

/**
 * Applies phrase-level replacements
 */
function replacePhrases(text: string): string {
  let result = text;

  for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

/**
 * Occasionally adds Chicago-style suffixes to sentences
 */
function addRandomSuffixes(text: string): string {
  // Split by sentence-ending punctuation, keeping the punctuation
  const sentences = text.split(/([.!?]+)/);

  return sentences.map((part, index) => {
    // Only process actual sentences (not punctuation parts)
    if (index % 2 === 0 && part.trim().length > 20) {
      // Random chance to add suffix
      if (Math.random() < SUFFIX_PROBABILITY) {
        const suffix = RANDOM_SUFFIXES[Math.floor(Math.random() * RANDOM_SUFFIXES.length)];
        return part.trimEnd() + suffix;
      }
    }
    return part;
  }).join('');
}

/**
 * Main transformation function
 * Converts standard English text to Chicago dialect
 */
export function chicagoify(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Skip very short strings (likely not real content)
  if (text.trim().length < 2) {
    return text;
  }

  // Skip strings that look like code, URLs, or technical content
  if (
    text.includes('://') ||
    text.includes('{{') ||
    text.includes('<%') ||
    /^[A-Z_]+$/.test(text) || // ALL_CAPS constants
    /^\d+$/.test(text) // Pure numbers
  ) {
    return text;
  }

  let result = text;

  // Apply transformations in order
  result = replacePhrases(result);  // Phrases first (longer matches)
  result = replaceWords(result);     // Then individual words
  result = addRandomSuffixes(result); // Finally, occasional suffixes

  return result;
}

/**
 * Walks the DOM and transforms all text nodes
 */
export function chicagoifyDOM(root: Element = document.body): void {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip script and style tags
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        const tagName = parent.tagName.toLowerCase();
        if (['script', 'style', 'noscript', 'code', 'pre', 'textarea', 'input'].includes(tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        // Skip if parent has data-no-chicago attribute
        if (parent.closest('[data-no-chicago]')) {
          return NodeFilter.FILTER_REJECT;
        }

        // Skip empty or whitespace-only nodes
        if (!node.textContent?.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes: Text[] = [];
  let node: Text | null;

  while ((node = walker.nextNode() as Text | null)) {
    textNodes.push(node);
  }

  // Transform all collected text nodes
  for (const textNode of textNodes) {
    if (textNode.textContent) {
      const original = textNode.textContent;
      const transformed = chicagoify(original);
      if (transformed !== original) {
        textNode.textContent = transformed;
      }
    }
  }
}

/**
 * Creates a MutationObserver that transforms new content as it's added
 * Uses a flag to prevent infinite loops from self-triggered mutations
 */
let isTransforming = false;

export function createChicagoObserver(): MutationObserver {
  return new MutationObserver((mutations) => {
    // Prevent infinite loop - if we're already transforming, skip
    if (isTransforming) return;

    isTransforming = true;

    try {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
              const textNode = node as Text;
              if (textNode.textContent) {
                const transformed = chicagoify(textNode.textContent);
                if (transformed !== textNode.textContent) {
                  textNode.textContent = transformed;
                }
              }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              chicagoifyDOM(node as Element);
            }
          }
        } else if (mutation.type === 'characterData') {
          const textNode = mutation.target as Text;
          if (textNode.textContent && !textNode.parentElement?.closest('[data-no-chicago]')) {
            const transformed = chicagoify(textNode.textContent);
            if (transformed !== textNode.textContent) {
              textNode.textContent = transformed;
            }
          }
        }
      }
    } finally {
      // Use setTimeout to reset flag after current execution context
      setTimeout(() => {
        isTransforming = false;
      }, 0);
    }
  });
}

export default chicagoify;
