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
  'about': 'about',
  'over': 'ova',
  'over there': 'over by dere',
  'Over': 'Ova',
  'here': 'here',
  'there': 'dere',
  'There': 'Dere',
  'where': 'where',
  'with': 'wit',
  'With': 'Wit',
  
  // Food and drink
  'pizza': 'tavern-style thin crust',
  'Pizza': 'Tavern-Style Thin Crust',
  'slice': 'square',
  'Slice': 'Square',
  'slices': 'squares',
  'Slices': 'Squares',
  'hot dog': 'Chicago dog',
  'Hot dog': 'Chicago dog',
  'beer': 'Old Style',
  'Beer': 'Old Style',
  'soda': 'pop',
  'Soda': 'Pop',
  'cheese': 'motz',
  'Cheese': 'Motz',
  'sauce': 'gravy',
  'Sauce': 'Gravy',
  'pepperoni': 'roni',
  'Pepperoni': 'Roni',
  'sausage': 'sasage',
  'Sausage': 'Sasage',
  
  // Places
  'restaurant': 'joint',
  'Restaurant': 'Joint',
  'restaurants': 'joints',
  'Restaurants': 'Joints',
  'establishment': 'spot',
  'Establishment': 'Spot',
  'establishments': 'spots',
  'venue': 'place',
  'Venue': 'Place',
  'location': 'spot',
  'Location': 'Spot',
  'place': 'spot',
  'Place': 'Spot',
  'city': 'da city',
  'City': 'Da city',
  'neighborhood': 'da neighborhood',
  'Neighborhood': 'Da Neighborhood',
  
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
  'member': 'guy',
  'Member': 'Guy',
  'members': 'da guys',
  'individual': 'guy',
  'Individual': 'Guy',
  'person': 'somebody',
  'Person': 'Somebody',
  
  // Sports teams (the holy trinity)
  'team': 'da Bears',
  'Team': 'Da Bears',
  'Chicago': 'Chi-town',
  'football': 'da Bears',
  'Football': 'Da Bears',
  'baseball': 'da Sox',
  'Baseball': 'Da Sox',
  'hockey': 'da Hawks',
  'Hockey': 'Da Hawks',

  // Specific Navigation & Site Content
  'Home': 'Da Home',
  'About GCPC': 'About Da GCPC',
  'About': 'About',
  'Members': 'Da Guys',

  'Events': 'Da Hangouts',
  'Compare': 'Check Out',
  'Infographics': 'Da Pictures',
  'il volto di Dio': 'il volto di Pope Leo',

  // Site-specific content
  'GCPC': 'Da GCPC',
  'Greater Chicagoland Pizza Club': 'Da Greater Chi-town Tavern-Style Club',
  'Club Members': 'Da Guys',
  'Our Members': 'Our Guys',
  'Member Since': 'Guy Since',
  'Role': 'What He Does',
  'Restaurants Visited with the Club': 'Joints We Hit Wit Da Club',
  'Show More': 'Show More Stuff',
  'Show Less': 'Show Less Stuff',
  'No restaurant visits recorded yet': 'Ain\'t been to no joints yet',
  'Meet the passionate pizza lovers': 'Meet da real tavern-style lovers',
  'passionate pizza lovers': 'real tavern-style lovers',
  
  // Footer content
  'All rights reserved': 'Sister Jean blesses dis site, all rights reserved',
  'Dedicated to the pursuit of perfect pizza': 'Dedicated to findin\' da perfect tavern-style',
  'perfect pizza': 'perfect pie',

  // Corporate titles & roles (expanded for all members)
  'Vice President': 'Main Guy',
  'vice president': 'main guy',
  'President': 'Da Boss',
  'president': 'da boss',
  'Chief': 'Head',
  'chief': 'head',
  'Officer': 'Guy',
  'officer': 'guy',
  'Director': 'Guy Runnin\'',
  'director': 'guy runnin\'',
  'Manager': 'Guy in Charge',
  'manager': 'guy in charge',
  'Coordinator': 'Guy Who Handles',
  'coordinator': 'guy who handles',
  'Specialist': 'Guy Who Knows',
  'specialist': 'guy who knows',
  'Management': 'Runnin\'',
  'management': 'runnin\'',
  'Growth': 'Makin\' It Bigger',
  'growth': 'makin\' it bigger',
  'Development': 'Buildin\'',
  'development': 'buildin\'',
  'Operations': 'Day-to-Day',
  'operations': 'day-to-day',
  'Strategic': 'Smart',
  'strategic': 'smart',
  'Executive': 'Big Shot',
  'executive': 'big shot',
  'Senior': 'Main',
  'senior': 'main',
  'Junior': 'New',
  'junior': 'new',
  'Associate': 'Helper',
  'associate': 'helper',
  'Assistant': 'Right-Hand',
  'assistant': 'right-hand',

  // Member bio specific terms
  'expertise': 'know-how',
  'Expertise': 'Know-how',
  'experience': 'time doin\'',
  'Experience': 'Time doin\'',
  'background': 'where he comes from',
  'Background': 'Where he comes from',
  'journey': 'story',
  'Journey': 'Story',
  'passion': 'love',
  'Passion': 'Love',
  'passionate': 'real into',
  'Passionate': 'Real into',
  'dedication': 'stickin\' to it',
  'Dedication': 'Stickin\' to it',
  'devoted': 'all about',
  'Devoted': 'All about',
  'enthusiast': 'guy who loves',
  'Enthusiast': 'Guy who loves',
  'aficionado': 'guy who knows',
  'Aficionado': 'Guy who knows',
  'connoisseur': 'guy wit taste',
  'Connoisseur': 'Guy wit taste',
  'expert': 'guy who knows his stuff',
  'Expert': 'Guy who knows his stuff',
  'authority': 'da guy to ask',
  'Authority': 'Da guy to ask',

  // Formal business speak (expanded)
  'optimizing': 'fixin\' up',
  'optimize': 'make better',
  'maintaining': 'keepin\'',
  'maintain': 'keep',
  'organized': 'straight',
  'organize': 'get straight',
  'environment': 'spot',
  'atmosphere': 'vibe',
  'ambiance': 'feel',
  'dining environment': 'eatin\' spot',
  'overall': 'whole',
  'comprehensive': 'all of it',
  'extensive': 'whole lotta',
  'enhancing': 'makin\' better',
  'enhance': 'make better',
  'improving': 'fixin\'',
  'improve': 'fix up',
  'ensuring': 'makin\' sure',
  'ensures': 'makes sure',
  'Ensures': 'Makes sure',
  'ensure': 'make sure',
  'precisely': 'exactly',
  'accurate': 'right',
  'meticulous': 'real careful',
  'encompasses': 'covers',
  'includes': 'got',
  'aspects': 'parts',
  'elements': 'things',
  'components': 'pieces',
  'significantly': 'really',
  'substantial': 'big-time',
  'considerable': 'whole lotta',
  'contributed': 'helped out',
  'contribute': 'help out',
  'providing': 'givin\'',
  'provide': 'give',
  'guarantees': 'makes sure',
  'guarantee': 'promise',
  'streamlined': 'smooth',
  'efficient': 'no-nonsense',
  'effective': 'works good',
  'successful': 'did good',
  'excellence': 'bein\' da best',
  'quality': 'good stuff',
  'premier': 'top',
  'superior': 'better',
  'exceptional': 'real good',
  'outstanding': 'crazy good',

  // Pizza evaluation terms
  'evaluation': 'checkin\' out',
  'Evaluation': 'Checkin\' out',
  'assessment': 'sizin\' up',
  'Assessment': 'Sizin\' up',
  'rating': 'score',
  'Rating': 'Score',
  'review': 'take',
  'Review': 'Take',
  'critique': 'thoughts',
  'Critique': 'Thoughts',
  'analysis': 'breakdown',
  'Analysis': 'Breakdown',
  'judgment': 'call',
  'Judgment': 'Call',
  'opinion': 'take',
  'Opinion': 'Take',
  'perspective': 'way he sees it',
  'Perspective': 'Way he sees it',
  'criteria': 'what matters',
  'Criteria': 'What matters',
  'standards': 'da bar',
  'Standards': 'Da bar',
  'methodology': 'how we do it',
  'Methodology': 'How we do it',

  // Fancy adjectives (expanded)
  'unparalleled': 'nobody else got',
  'innovative': 'different',
  'pioneering': 'first to do',
  'renowned': 'everybody knows',
  'Renowned': 'Everybody knows',
  'distinguished': 'well-known',
  'Distinguished': 'Well-known',
  'esteemed': 'respected',
  'Esteemed': 'Respected',
  'acclaimed': 'everybody loves',
  'Acclaimed': 'Everybody loves',
  'celebrated': 'famous for',
  'Celebrated': 'Famous for',
  'notable': 'worth knowin\'',
  'Notable': 'Worth knowin\'',
  'prominent': 'big name',
  'Prominent': 'Big name',
  'influential': 'makes things happen',
  'Influential': 'Makes things happen',
  'enjoyable': 'good',
  'delightful': 'real nice',
  'pleasant': 'nice',
  'wonderful': 'great',
  'excellent': 'top notch',
  'superb': 'real good',
  'magnificent': 'beautiful',
  'remarkable': 'somethin\' else',
  'extraordinary': 'wild',
  'impressive': 'not bad',
  'well-meaning': 'tryna help',
  'frivolous': 'random',
  'unnecessary': 'extra',
  'essential': 'gotta have',
  'crucial': 'real important',
  'vital': 'need it',
  'fundamental': 'basic',
  'sophisticated': 'fancy',
  'refined': 'classy',
  'elegant': 'nice lookin\'',
  'premium': 'top shelf',
  'authentic': 'real deal',
  'genuine': 'legit',
  'traditional': 'old school',
  'contemporary': 'new style',
  'modern': 'nowadays',

  // Policy and procedure terms
  '"No Ask, No Glass"': '"Don\'t Want It, Don\'t Bring It"',
  'policy': 'rule',
  'Policy': 'Rule',
  'procedure': 'how we do',
  'Procedure': 'How we do',
  'protocol': 'da way',
  'Protocol': 'Da way',
  'guideline': 'rule of thumb',
  'Guideline': 'Rule of thumb',
  'regulation': 'rule',
  'Regulation': 'Rule',
  'requirement': 'what ya need',
  'Requirement': 'What ya need',
  'standard': 'how it\'s done',
  'Standard': 'How it\'s done',
  'practice': 'what we do',
  'Practice': 'What we do',
  'approach': 'way',
  'Approach': 'Way',
  'method': 'how',
  'Method': 'How',
  'technique': 'trick',
  'Technique': 'Trick',
  'strategy': 'game plan',
  'Strategy': 'Game plan',
  'initiative': 'new thing',
  'Initiative': 'New thing',
  'implementation': 'doin\' it',
  'Implementation': 'Doin\' it',

  // Action words
  'advocacy': 'pushin\' for',
  'commitment': 'stickin\' wit',
  'leadership': 'runnin\' things',
  'organization': 'keepin\' stuff straight',
  'coordination': 'gettin\' everybody together',
  'collaboration': 'workin\' together',
  'communication': 'talkin\'',
  'facilitation': 'helpin\' out',
  'administration': 'paperwork',
  'supervision': 'watchin\' over',
  'oversight': 'keepin\' an eye on',
  'governance': 'who\'s in charge',
  'stewardship': 'takin\' care of',

  // Restaurant and dining specific
  'cuisine': 'food',
  'Cuisine': 'Food',
  'culinary': 'cookin\'',
  'Culinary': 'Cookin\'',
  'gastronomic': 'food',
  'Gastronomic': 'Food',
  
  'eatery': 'place to eat',
  'Eatery': 'Place to eat',
  'pizzeria': 'pizza joint',
  'Pizzeria': 'Pizza joint',

  'bistro': 'little spot',
  'Bistro': 'Little spot',
  'waitstaff': 'servers',
  'server': 'kid bringin\' food',
  'Server': 'Kid bringin\' food',
  'waiter': 'guy bringin\' food',
  'Waiter': 'Guy bringin\' food',
  'waitress': 'gal bringin\' food',
  'Waitress': 'Gal bringin\' food',
  'bartender': 'guy pourin\' drinks',
  'Bartender': 'Guy pourin\' drinks',
  'chef': 'cook',
  'Chef': 'Cook',
  'proprietor': 'owner',
  'Proprietor': 'Owner',
  'patron': 'customer',
  'Patron': 'Customer',
  'clientele': 'folks who come',
  'Clientele': 'Folks who come',
  'water glasses': 'dem water glasses',
  'table space': 'room on da table',
  'table management': 'keepin\' da table right',
  'Table Management': 'Keepin\' Da Table Right',
  'dining experience': 'meal',
  'dining': 'eatin\'',
  'Dining': 'Eatin\'',
  'meal': 'grub',
  'Meal': 'Grub',
  'food': 'grub',
  'Food': 'Grub',
  'beverage': 'drink',
  'Beverage': 'Drink',
  'appetizer': 'starter',
  'Appetizer': 'Starter',
  'entree': 'main thing',
  'Entree': 'Main thing',
  'dessert': 'sweet stuff',
  'Dessert': 'Sweet stuff',
  'menu': 'what they got',
  'Menu': 'What they got',
  'special': 'today\'s thing',
  'Special': 'Today\'s thing',
  'recommendation': 'what\'s good',
  'Recommendation': 'What\'s good',

  // Club-specific activities
  'club gatherings': 'when we all get together',
  'gatherings': 'get-togethers',
  'Gatherings': 'Get-togethers',
  'meetings': 'meetups',
  'Meetings': 'Meetups',
  'events': 'things we do',
  'activities': 'stuff',
  'Activities': 'Stuff',
  'excursions': 'trips',
  'Excursions': 'Trips',
  'outings': 'goin\' out',
  'Outings': 'Goin\' out',
  'adventures': 'good times',
  'Adventures': 'Good times',
  'experiences': 'times',
  'Experiences': 'Times',
  'pizza experience': 'pizza time',
  'dining adventure': 'eatin\' out',
  'culinary journey': 'food trip',
  'gastronomic exploration': 'tryin\' new spots',
  'tasting': 'tryin\'',
  'Tasting': 'Tryin\'',
  'sampling': 'gettin\' a taste',
  'Sampling': 'Gettin\' a taste',

  // Descriptive terms
  'throughout': 'da whole',
  'Throughout': 'Da whole',
  'during': 'when',
  'During': 'When',
  'within': 'in',
  'Within': 'In',
  'among': 'wit',
  'Among': 'Wit',
  'between': 'between',
  'across': 'all over',
  'Across': 'All over',
  'every item': 'errything',
  'everything': 'errything',
  'Everything': 'Errything',
  'something': 'somethin\'',
  'Something': 'Somethin\'',
  'nothing': 'nothin\'',
  'Nothing': 'Nothin\'',
  'anything': 'anything',
  'everyone': 'errybody',
  'Everyone': 'Errybody',
  'somebody': 'somebody',
  'Somebody': 'Somebody',
  'nobody': 'nobody',
  'Nobody': 'Nobody',
  'anybody': 'anybody',
  'Anybody': 'Anybody',

  // Impact and influence terms
  'intrusion': 'buttin\' in',
  'disruption': 'messin\' things up',
  'interference': 'gettin\' in da way',
  'minimized': 'cut down on',
  'minimize': 'cut down',
  'maximized': 'got da most',
  'maximize': 'get da most',
  'reduced': 'made less',
  'reduce': 'make less',
  'increased': 'made more',
  'increase': 'make more',
  'elevated': 'brought up',
  'elevate': 'bring up',
  'enhanced': 'made better',
  'transformed': 'changed up',
  'transform': 'change up',
  'revolutionized': 'changed da game',
  'revolutionize': 'change da game',
  'influenced': 'had a say in',
  'influence': 'have a say',
  'impacted': 'hit',
  'impact': 'hit',
  'affected': 'changed',
  'affect': 'change',
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
  { pattern: /\bhighly\s+/gi, replacement: "real " },
  { pattern: /\btruly\s+/gi, replacement: "for real " },
  { pattern: /\babsolutely\s+/gi, replacement: "totally " },
  { pattern: /\bcompletely\s+/gi, replacement: "all the way " },
  
  // Chicago pronunciations
  { pattern: /\bfor\b/g, replacement: "fer" },
  { pattern: /\bFor\b/g, replacement: "Fer" },
  { pattern: /\bsure\b/g, replacement: "shore" },
  { pattern: /\bSure\b/g, replacement: "Shore" },

  
  // Contractions and casual speech
  { pattern: /\bhave to\b/g, replacement: "gotta" },
  { pattern: /\bHave to\b/g, replacement: "Gotta" },
  { pattern: /\bgoing to\b/g, replacement: "gonna" },
  { pattern: /\bGoing to\b/g, replacement: "Gonna" },
  { pattern: /\bwant to\b/g, replacement: "wanna" },
  { pattern: /\bWant to\b/g, replacement: "Wanna" },
  { pattern: /\blet me\b/g, replacement: "lemme" },
  { pattern: /\bLet me\b/g, replacement: "Lemme" },
  { pattern: /\bgive me\b/g, replacement: "gimme" },
  { pattern: /\bGive me\b/g, replacement: "Gimme" },
  { pattern: /\bout of\b/g, replacement: "outta" },
  { pattern: /\bOut of\b/g, replacement: "Outta" },
  { pattern: /\bkind of\b/g, replacement: "kinda" },
  { pattern: /\bKind of\b/g, replacement: "Kinda" },
  { pattern: /\bsort of\b/g, replacement: "sorta" },
  { pattern: /\bSort of\b/g, replacement: "Sorta" },
  { pattern: /\ba lot of\b/g, replacement: "lotsa" },
  { pattern: /\bA lot of\b/g, replacement: "Lotsa" },
  { pattern: /\bought to\b/g, replacement: "oughta" },
  { pattern: /\bOught to\b/g, replacement: "Oughta" },

  // Formal phrases that need pattern replacement
  { pattern: /\bsharp eye for detail\b/g, replacement: "don't miss nothin'" },
  { pattern: /\bno-nonsense approach\b/g, replacement: "don't play around wit" },
  { pattern: /\bwidely adopted\b/g, replacement: "errybody does now" },
  { pattern: /\bindustry at large\b/g, replacement: "whole game" },
  { pattern: /\bextends beyond\b/g, replacement: "ain't just about" },
  { pattern: /\bthroughout the meal\b/g, replacement: "whole time we eatin'" },
  { pattern: /\bhas successfully\b/g, replacement: "been" },
  { pattern: /\bHis leadership\b/g, replacement: "Him bein' in charge" },
  { pattern: /\bHis vigilance\b/g, replacement: "Him watchin' errything" },
  { pattern: /\bHis dedication\b/g, replacement: "Him stickin' wit it" },
  { pattern: /\bHis expertise\b/g, replacement: "His know-how" },
  { pattern: /\bHis passion\b/g, replacement: "Him lovin'" },
  { pattern: /\bHis commitment\b/g, replacement: "Him stickin' ta" },
  { pattern: /\bHis approach\b/g, replacement: "Da way he does it" },
  { pattern: /\bHis role\b/g, replacement: "What he does" },
  { pattern: /\bHis contribution\b/g, replacement: "What he brings" },
  { pattern: /\bwhere every slice is savored\b/g, replacement: "where we can eat our squares" },
  { pattern: /\bwithout the distraction of\b/g, replacement: "without dealin' wit" },
  { pattern: /\bbrings his (.+?) to\b/g, replacement: "got dat $1 fer" },
  { pattern: /\bWith a (.+?), he\b/g, replacement: "He got a $1 and" },
  { pattern: /\bWith an? (.+?), he\b/g, replacement: "He got a $1 and" },
  { pattern: /\bThis (.+?), now\b/g, replacement: "Dis $1 dat" },
  { pattern: /\bknown for his\b/g, replacement: "everybody knows him fer his" },
  { pattern: /\bKnown for his\b/g, replacement: "Everybody knows him fer his" },
  { pattern: /\bresponsible for\b/g, replacement: "handles" },
  { pattern: /\bResponsible for\b/g, replacement: "Handles" },
  { pattern: /\bin charge of\b/g, replacement: "runnin'" },
  { pattern: /\bIn charge of\b/g, replacement: "Runnin'" },
  { pattern: /\bspecializes in\b/g, replacement: "knows all about" },
  { pattern: /\bSpecializes in\b/g, replacement: "Knows all about" },
  { pattern: /\bfocuses on\b/g, replacement: "all about" },
  { pattern: /\bFocuses on\b/g, replacement: "All about" },
  { pattern: /\bdedicated to\b/g, replacement: "all in on" },
  { pattern: /\bDedicated to\b/g, replacement: "All in on" },
  { pattern: /\bcommitted to\b/g, replacement: "stickin' wit" },
  { pattern: /\bCommitted to\b/g, replacement: "Stickin' wit" },
  { pattern: /\bpassionate about\b/g, replacement: "real into" },
  { pattern: /\bPassionate about\b/g, replacement: "Real into" },
  { pattern: /\benthusiastic about\b/g, replacement: "pumped about" },
  { pattern: /\bEnthusiastic about\b/g, replacement: "Pumped about" },
  { pattern: /\bexpert in\b/g, replacement: "knows his stuff about" },
  { pattern: /\bExpert in\b/g, replacement: "Knows his stuff about" },
  { pattern: /\bauthority on\b/g, replacement: "da guy ta ask about" },
  { pattern: /\bAuthority on\b/g, replacement: "Da guy ta ask about" },
  { pattern: /\bleading the way\b/g, replacement: "showin' errybody how" },
  { pattern: /\bLeading the way\b/g, replacement: "Showin' errybody how" },
  { pattern: /\bsetting the standard\b/g, replacement: "showin' how it's done" },
  { pattern: /\bSetting the standard\b/g, replacement: "Showin' how it's done" },
  { pattern: /\braising the bar\b/g, replacement: "makin' it better" },
  { pattern: /\bRaising the bar\b/g, replacement: "Makin' it better" },
  { pattern: /\bpushing boundaries\b/g, replacement: "doin' new stuff" },
  { pattern: /\bPushing boundaries\b/g, replacement: "Doin' new stuff" },
  { pattern: /\bbreaking new ground\b/g, replacement: "doin' it different" },
  { pattern: /\bBreaking new ground\b/g, replacement: "Doin' it different" },
  { pattern: /\bpioneering efforts\b/g, replacement: "bein' first" },
  { pattern: /\bPioneering efforts\b/g, replacement: "Bein' first" },
  { pattern: /\binnovative solutions\b/g, replacement: "new ways" },
  { pattern: /\bInnovative solutions\b/g, replacement: "New ways" },
  { pattern: /\bstrategic vision\b/g, replacement: "game plan" },
  { pattern: /\bStrategic vision\b/g, replacement: "Game plan" },
  { pattern: /\boperational excellence\b/g, replacement: "runnin' things good" },
  { pattern: /\bOperational excellence\b/g, replacement: "Runnin' things good" },
  { pattern: /\bquality assurance\b/g, replacement: "makin' shore it's good" },
  { pattern: /\bQuality assurance\b/g, replacement: "Makin' shore it's good" },
  { pattern: /\bbest practices\b/g, replacement: "da right way" },
  { pattern: /\bBest practices\b/g, replacement: "Da right way" },
  { pattern: /\bindustry standards\b/g, replacement: "how errybody does it" },
  { pattern: /\bIndustry standards\b/g, replacement: "How errybody does it" },
  { pattern: /\bcore values\b/g, replacement: "what matters" },
  { pattern: /\bCore values\b/g, replacement: "What matters" },
  { pattern: /\bteam player\b/g, replacement: "good guy ta have around" },
  { pattern: /\bTeam player\b/g, replacement: "Good guy ta have around" },
  { pattern: /\bgo-to person\b/g, replacement: "da guy" },
  { pattern: /\bGo-to person\b/g, replacement: "Da guy" },
  { pattern: /\btakes pride in\b/g, replacement: "proud of" },
  { pattern: /\bTakes pride in\b/g, replacement: "Proud of" },
  { pattern: /\bgoes above and beyond\b/g, replacement: "does extra" },
  { pattern: /\bGoes above and beyond\b/g, replacement: "Does extra" },
  { pattern: /\battention to detail\b/g, replacement: "watchin' da little stuff" },
  { pattern: /\bAttention to detail\b/g, replacement: "Watchin' da little stuff" },
  { pattern: /\byears of experience\b/g, replacement: "been doin' dis fer years" },
  { pattern: /\bYears of experience\b/g, replacement: "Been doin' dis fer years" },
  { pattern: /\bwealth of knowledge\b/g, replacement: "knows a lot" },
  { pattern: /\bWealth of knowledge\b/g, replacement: "Knows a lot" },
  { pattern: /\bdeep understanding\b/g, replacement: "really gets it" },
  { pattern: /\bDeep understanding\b/g, replacement: "Really gets it" },
  { pattern: /\bcomprehensive approach\b/g, replacement: "covers errything" },
  { pattern: /\bComprehensive approach\b/g, replacement: "Covers errything" },
  { pattern: /\bholistic perspective\b/g, replacement: "sees da whole picture" },
  { pattern: /\bHolistic perspective\b/g, replacement: "Sees da whole picture" },
  { pattern: /\bproven track record\b/g, replacement: "always delivers" },
  { pattern: /\bProven track record\b/g, replacement: "Always delivers" },
  { pattern: /\bconsistently delivers\b/g, replacement: "always brings it" },
  { pattern: /\bConsistently delivers\b/g, replacement: "Always brings it" },
  { pattern: /\bexceeds expectations\b/g, replacement: "does more than ya think" },
  { pattern: /\bExceeds expectations\b/g, replacement: "Does more than ya think" },
  { pattern: /\bmakes a difference\b/g, replacement: "matters" },
  { pattern: /\bMakes a difference\b/g, replacement: "Matters" },
  { pattern: /\badds value\b/g, replacement: "brings somethin'" },
  { pattern: /\bAdds value\b/g, replacement: "Brings somethin'" },
  { pattern: /\bdrives results\b/g, replacement: "gets it done" },
  { pattern: /\bDrives results\b/g, replacement: "Gets it done" },
  { pattern: /\bdelivers results\b/g, replacement: "gets it done" },
  { pattern: /\bDelivers results\b/g, replacement: "Gets it done" },
];

// Sentence endings and connectors
const SENTENCE_ENDINGS = [
  ', ya know?',
  ', eh?',
  ', fer shore',
  ', no joke',
  ', I tell ya',
  ', believe dat',
  ', straight up',
  ', on my mother',
  ', swear ta God',
  ', hundred percent',
];

// Chicago-specific phrases to randomly inject
const CHICAGO_PHRASES = [
  'Da Bears!',
  'Ditka would approve!',
  'Jordan would\'a loved dis!',
  'Just like Vito & Nick\'s!',
  'Reminds me of da old neighborhood!',
  'Now dat\'s Chi-town!',
  'Dat\'s how we do it on da South Side!',
  'Just like ma used ta make!',
  'Better than Lou Malnati\'s!',
  'Take dat, New York!',
];

// Probability of adding sentence endings (0-1)
const SENTENCE_ENDING_PROBABILITY = 0.15;

// Probability of injecting Chicago phrases (0-1)
const PHRASE_INJECTION_PROBABILITY = 0.02;

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
    // Add to sentences that end with periods
    translated = translated.replace(/\.(\s|$)/g, `${ending}$1`);
  }

  // Randomly inject Chicago phrases (very sparingly)
  if (Math.random() < PHRASE_INJECTION_PROBABILITY && translated.length > 50) {
    const phrase = CHICAGO_PHRASES[Math.floor(Math.random() * CHICAGO_PHRASES.length)];
    // Add after first sentence
    translated = translated.replace(/\.(\s)/, `. ${phrase}$1`);
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

  // Skip numbers and dates
  if (text.match(/^\d+$/) || text.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return false;
  }

  // Skip what looks like code or technical content
  if (text.match(/^[A-Z_][A-Z0-9_]*$/) || text.match(/^\d+(\.\d+)*$/)) {
    return false;
  }

  // Skip actual member names (you can expand this list)
  const memberNames = [
    'Joe Cirillo', 'Ryan Coe', 'Chris Daum', 'Bob Gill',
    'Pat Kleszynski', 'Kevin Martin', 'Matt Oriente', 'Bill Brumett'
  ];
  if (memberNames.some(name => text.includes(name))) {
    return false;
  }

  return true;
}