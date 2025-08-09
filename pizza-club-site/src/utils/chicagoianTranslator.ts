/**
 * Chicagoian Translator - Converts text to stereotypical South Side Chicago dialect
 * Inspired by SNL Super Fans and authentic Chicago speech patterns
 */

interface TranslationRule {
  pattern: RegExp;
  replacement: string;
}

// Word-level replacements
const WORD_REPLACEMENTS: Record<string, string> = {
  // Articles and pronouns
  'the': 'da',
  'The': 'Da',
  'these': 'dese',
  'These': 'Dese',
  'those': 'dose',
  'Those': 'Dose',
  'this': 'dis',
  'This': 'Dis',
  'that': 'dat',
  'That': 'Dat',
  'them': 'dem',
  'Them': 'Dem',
  'you': 'youse',
  'You': 'Youse',
  'your': 'yer',
  'Your': 'Yer',
  
  // Common words
  'about': 'aboot',
  'over': 'ova',
  'Over': 'Ova',
  'here': 'here',
  'there': 'dere',
  'There': 'Dere',
  'where': 'where',
  'with': 'wit',
  'With': 'Wit',
  
  // Food and drink
  'pizza': 'deep dish',
  'Pizza': 'Deep dish',
  'hot dog': 'Chicago dog',
  'Hot dog': 'Chicago dog',
  'beer': 'Old Style',
  'Beer': 'Old Style',
  'soda': 'pop',
  'Soda': 'Pop',
  
  // Places
  'restaurant': 'joint',
  'Restaurant': 'Joint',
  'place': 'spot',
  'Place': 'Spot',
  'city': 'da city',
  'City': 'Da city',
  
  // People
  'people': 'folks',
  'People': 'Folks',
  'guy': 'guy',
  'guys': 'guys',
  'Guys': 'Guys',
  'friend': 'buddy',
  'Friend': 'Buddy',
  'friends': 'buddies',
  'Friends': 'Buddies',
  
  // Sports teams (the holy trinity)
  'team': 'da Bears',
  'Team': 'Da Bears',
  'Chicago': 'Chi-town',
  'football': 'da Bears',
  'Football': 'Da Bears',
  'baseball': 'da Cubs',
  'Baseball': 'Da Cubs',
  'hockey': 'da Hawks',
  'Hockey': 'Da Hawks',

  // Specific Navigation & Site Content
  'Home': 'Da Home',
  'About GCPC': 'About Da GCPC',
  'About': 'About',
  'Members': 'Da Guys',
  'Restaurants': 'Da Joints',
  'Events': 'Da Hangouts',
  'Compare': 'Check Out',
  'Infographics': 'Da Pictures',
  
  // Site-specific content
  'GCPC': 'Da GCPC',
  'Greater Chicagoland Pizza Club': 'Da Greater Chi-town Deep Dish Club',
  'Club Members': 'Da Guys',
  'Our Members': 'Our Guys',
  'Member Since': 'Guy Since',
  'Role': 'What He Does',
  'Restaurants Visited with the Club': 'Joints We Hit Wit Da Club',
  'Show More': 'Show More Stuff',
  'Show Less': 'Show Less Stuff',
  'No restaurant visits recorded yet': 'Ain\'t been to no joints yet',
  'Meet the passionate pizza lovers': 'Meet da real deep dish lovers',
  'passionate pizza lovers': 'real deep dish lovers',
  
  // Footer content
  'All rights reserved': 'All rights reserved fer da guys',
  'Dedicated to the pursuit of perfect pizza': 'Dedicated to findin\' da perfect deep dish',
  'perfect pizza': 'perfect deep dish',
};

// Pattern-based replacements
const PATTERN_REPLACEMENTS: TranslationRule[] = [
  // Drop 'g' from -ing endings
  { pattern: /\b(\w+)ing\b/g, replacement: "$1in'" },
  { pattern: /\b(\w+)ING\b/g, replacement: "$1IN'" },
  
  // Add emphasis patterns
  { pattern: /\bvery\s+/gi, replacement: "real " },
  { pattern: /\breally\s+/gi, replacement: "real " },
  { pattern: /\bextremely\s+/gi, replacement: "super " },
  
  // Chicago pronunciations
  { pattern: /\bfor\b/g, replacement: "fer" },
  { pattern: /\bFor\b/g, replacement: "Fer" },
  { pattern: /\bsure\b/g, replacement: "shore" },
  { pattern: /\bSure\b/g, replacement: "Shore" },
];

// Sentence endings and connectors
const SENTENCE_ENDINGS = [
  ', eh?',
  ', you betcha.',
  ', dontcha know.',
  ', no kiddin\'.',
  ', ya know?',
  ', am I right?',
];

// Chicago-specific phrases to randomly inject
const CHICAGO_PHRASES = [
  'Da Bears!',
  'Ditka!',
  'Superfans unite!',
  'Chi-town represent!',
  'Deep dish is da only dish!',
  'Daaaaa Bears!',
  'Polish sausage and a Old Style!',
  'Dis is da way!',
];

// Probability of adding sentence endings (0-1)
const SENTENCE_ENDING_PROBABILITY = 0.3;

// Probability of injecting Chicago phrases (0-1)
const PHRASE_INJECTION_PROBABILITY = 0.05;

/**
 * Translates text to Chicagoian dialect
 */
export function translateToChicagoian(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let translated = text;

  // Apply word-level replacements
  Object.entries(WORD_REPLACEMENTS).forEach(([original, replacement]) => {
    // Use word boundaries to avoid partial replacements
    const regex = new RegExp(`\\b${escapeRegExp(original)}\\b`, 'g');
    translated = translated.replace(regex, replacement);
  });

  // Apply pattern-based replacements
  PATTERN_REPLACEMENTS.forEach(({ pattern, replacement }) => {
    translated = translated.replace(pattern, replacement);
  });

  // Add sentence endings randomly
  if (Math.random() < SENTENCE_ENDING_PROBABILITY) {
    const ending = SENTENCE_ENDINGS[Math.floor(Math.random() * SENTENCE_ENDINGS.length)];
    // Add to sentences that end with periods, exclamation marks, or are questions
    translated = translated.replace(/([.!?])(\s|$)/g, `${ending}$2`);
  }

  // Randomly inject Chicago phrases (very sparingly)
  if (Math.random() < PHRASE_INJECTION_PROBABILITY) {
    const phrase = CHICAGO_PHRASES[Math.floor(Math.random() * CHICAGO_PHRASES.length)];
    translated = `${phrase} ${translated}`;
  }

  return translated;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if translation mode should be applied to this text
 * Skip certain types of content that shouldn't be translated
 */
export function shouldTranslate(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Skip very short text (like single letters or symbols)
  if (text.trim().length <= 2) {
    return false;
  }

  // Skip URLs
  if (text.match(/^https?:\/\//)) {
    return false;
  }

  // Skip email addresses
  if (text.match(/\S+@\S+\.\S+/)) {
    return false;
  }

  // Skip what looks like code or technical content
  if (text.match(/^[A-Z_][A-Z0-9_]*$/) || text.match(/^\d+(\.\d+)*$/)) {
    return false;
  }

  return true;
}