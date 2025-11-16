// Common English food words to Gujarati mapping
const englishToGujaratiDict: Record<string, string[]> = {
  // Common food terms
  'soup': ['સૂપ'],
  'sup': ['સૂપ'],
  'soop': ['સૂપ'],
  'cheese': ['ચીઝ', 'ચીજ'],
  'chiz': ['ચીઝ'],
  'cheez': ['ચીઝ'],
  'cheeje': ['ચીઝ'],
  'special': ['સ્પે', 'સ્પેશીયલ', 'સ્પેશલ'],
  'spe': ['સ્પે'],
  'dry': ['ડ્રાય', 'ડ્રા', 'સુકો', 'સુકી'],
  'fruit': ['ફ્રૂટ', 'ફ્રુટ'],
  'ice': ['આઈસ', 'આઇસ'],
  'cream': ['ક્રીમ'],
  'butter': ['બટર', 'મખ્ખન'],
  'milk': ['મીલ્ક', 'દૂધ'],
  'sweet': ['મીઠાઈ', 'સ્વીટ'],
  'mithai': ['મીઠાઈ'],
  'meethai': ['મીઠાઈ'],
  'mithayee': ['મીઠાઈ'],
  'peda': ['પેડા'],
  'pera': ['પેડા'],
  'barfi': ['બરફી'],
  'burfi': ['બરફી'],
  'laddu': ['લાડુ'],
  'ladu': ['લાડુ'],
  'ladoo': ['લાડુ'],
  'halwa': ['હલવો', 'હલવા'],
  'halvo': ['હલવો'],
  'halva': ['હલવો'],
  'dosa': ['ડોસા'],
  'dosaa': ['ડોસા'],
  'idli': ['ઇડલી'],
  'idly': ['ઇડલી'],
  'eedli': ['ઇડલી'],
  'eedlee': ['ઇડલી'],
  'vada': ['વડા'],
  'wada': ['વડા'],
  'vad': ['વડા'],
  'pakoda': ['પકોડા'],
  'pakora': ['પકોડા'],
  'pakodaa': ['પકોડા'],
  'samosa': ['સમોસા'],
  'samoosa': ['સમોસા'],
  'kachori': ['કચોરી'],
  'kachauri': ['કચોરી'],
  'bhajiya': ['ભજીયા'],
  'bhajia': ['ભજીયા'],
  'bhaji': ['ભાજી'],
  'bhajee': ['ભાજી'],
  'dhokla': ['ઢોકળા'],
  'dhokala': ['ઢોકળા'],
  'thepla': ['થેપલા'],
  'thepala': ['થેપલા'],
  'paratha': ['પરાઠા'],
  'pratha': ['પરાઠા'],
  'roti': ['રોટી', 'રોટલી'],
  'rotli': ['રોટલી', 'રોટી'],
  'rotali': ['રોટલી', 'રોટી'],
  'naan': ['નાન'],
  'nan': ['નાન'],
  'kulcha': ['કુલચા'],
  'kulchaa': ['કુલચા'],
  'rice': ['રાઈસ', 'ભાત'],
  'bhat': ['ભાત'],
  'bhaat': ['ભાત'],
  'dal': ['દાળ'],
  'daal': ['દાળ'],
  'curry': ['કરી'],
  'paneer': ['પનીર'],
  'panir': ['પનીર'],
  'paner': ['પનીર'],
  'masala': ['મસાલા'],
  'masla': ['મસાલા'],
  'tandoori': ['ટંડૂરી'],
  'tikka': ['ટીકા'],
  'biryani': ['બિરયાણી'],
  'biriyani': ['બિરયાણી'],
  'biriani': ['બિરયાણી'],
  'pulao': ['પુલાવ'],
  'pulav': ['પુલાવ'],
  'pilaf': ['પુલાવ'],
  'raita': ['રાયતા'],
  'rayta': ['રાયતા'],
  'chutney': ['ચટણી'],
  'chatni': ['ચટણી'],
  'papad': ['પાપડ'],
  'papadum': ['પાપડ'],
  'papadam': ['પાપડ'],
  'salad': ['સલાડ'],
  'juice': ['જ્યુસ'],
  'lassi': ['લસ્સી'],
  'lassee': ['લસ્સી'],
  'tea': ['ચા'],
  'coffee': ['કોફી'],
  'mango': ['મેંગો', 'આમ'],
  'pineapple': ['પાઈનેપલ', 'પાઈના'],
  'apple': ['એપલ', 'સફરજન'],
  'banana': ['બનાના', 'કેળા'],
  'orange': ['ઓરેંજ', 'સંત્રા'],
  'strawberry': ['સ્ટ્રોબેરી'],
  'kiwi': ['કીવી', 'કિવી'],
  'lychee': ['લીચી'],
  'coconut': ['કોકોનટ', 'નાળીયેર'],
  'corn': ['કોર્ન', 'કોન'],
  'babycorn': ['બેબીકોર્ન', 'બેબી કોર્ન'],
  'baby corn': ['બેબીકોર્ન', 'બેબી કોર્ન'],
  'bebicorn': ['બેબીકોર્ન'],
  'potato': ['બટાકા'],
  'bataka': ['બટાકા'],
  'batata': ['બટાકા'],
  'aloo': ['બટાકા', 'આલુ'],
  'tomato': ['ટમેટા', 'ટમાટા'],
  'tameta': ['ટમેટા'],
  'tamatar': ['ટમેટા'],
  'onion': ['ડુંગળી', 'કાંદા'],
  'dungli': ['ડુંગળી'],
  'dungali': ['ડુંગળી'],
  'kanda': ['કાંદા'],
  'capsicum': ['કેપ્સિકમ', 'શિમલા મરચા'],
  'capsikam': ['કેપ્સિકમ'],
  'bell pepper': ['કેપ્સિકમ', 'શિમલા મરચા'],
  'shimla mirch': ['શિમલા મરચા'],
  'mushroom': ['મશરૂમ', 'માસરૂમ'],
  'almond': ['બદામ', 'આલમંડ'],
  'badam': ['બદામ'],
  'badaam': ['બદામ'],
  'cashew': ['કાજુ'],
  'kaju': ['કાજુ'],
  'kajoo': ['કાજુ'],
  'pistachio': ['પીસ્તા'],
  'pista': ['પીસ્તા'],
  'pistaa': ['પીસ્તા'],
  'walnut': ['અખરોટ'],
  'akhrot': ['અખરોટ'],
  'kismis': ['કીસમીસ'],
  'kishmish': ['કીસમીસ'],
  'keesmis': ['કીસમીસ'],
  'keeshmish': ['કીસમીસ'],
  'date': ['ખજૂર'],
  'khajur': ['ખજૂર'],
  'khajoor': ['ખજૂર'],
  'fig': ['અંજીર'],
  'anjir': ['અંજીર'],
  'anjeer': ['અંજીર'],
  'rose': ['રોઝ', 'ગુલાબ'],
  'saffron': ['કેસર', 'કેશર'],
  'keshar': ['કેશર'],
  'cardamom': ['ઇલાયચી'],
  'elaichi': ['ઇલાયચી'],
  'elaychi': ['ઇલાયચી'],
  'ilaichi': ['ઇલાયચી'],
  'ilaychi': ['ઇલાયચી'],
  'chocolate': ['ચોકલેટ', 'ચોકો'],
  'choco': ['ચોકો'],
  'vanilla': ['વેનીલા'],
  'kesar': ['કેસર', 'કેશર'],
  'rasmalai': ['રસમલાઈ'],
  'ras malai': ['રસમલાઈ'],
  'gulabjamun': ['ગુલાબજામુન'],
  'gulab jamun': ['ગુલાબજામુન'],
  'jamun': ['જામુન', 'જામ'],
  'jalebi': ['જલેબી'],
  'jilapi': ['જલેબી'],
  'jilabi': ['જલેબી'],
  'sandwich': ['સેન્ડવીચ', 'સન્ડવીચ'],
  'pizza': ['પીઝા'],
  'burger': ['બર્ગર'],
  'roll': ['રોલ'],
  'cake': ['કેક'],
  'biscuit': ['બિસ્કીટ'],
  'cookie': ['કુકી'],
  'cooky': ['કુકી'],
  'cookee': ['કુકી'],
  'brownie': ['બ્રાઉની'],
  'pastry': ['પેસ્ટ્રી'],
  'hot': ['ગરમ', 'હોટ'],
  'cold': ['ઠંડા', 'કોલ્ડ'],
  'fresh': ['ફ્રેશ', 'તાજા'],
  'fried': ['ફ્રાઈડ', 'તળેલા'],
  'boiled': ['બોઈલ્ડ', 'બાફેલા'],
  'roasted': ['રોસ્ટેડ'],
  'mixed': ['મિક્સ', 'મિશ્ર'],
  'plain': ['પ્લેન', 'સાદા'],
  'spicy': ['સ્પાઈસી', 'તીખા'],
  'chili': ['ચિલી', 'ચીલી', 'ચીકી'],
  'chilli': ['ચિલી', 'ચીલી', 'ચીકી'],
  'chilly': ['ચિલી', 'ચીલી', 'ચીકી'],
  'sugar': ['સુગર', 'ખાંડ'],
  'free': ['ફ્રી'],
  'sugar free': ['સુગર ફ્રી'],
};

// Gujarati to English transliteration mapping
const gujaratiToEnglishMap: Record<string, string> = {
  // Consonants (with inherent 'a' sound)
  'ક': 'ka', 'ખ': 'kha', 'ગ': 'ga', 'ઘ': 'gha', 'ઙ': 'nga',
  'ચ': 'cha', 'છ': 'chha', 'જ': 'ja', 'ઝ': 'jha', 'ઞ': 'nya',
  'ટ': 'ta', 'ઠ': 'tha', 'ડ': 'da', 'ઢ': 'dha', 'ણ': 'na',
  'ત': 'ta', 'થ': 'tha', 'દ': 'da', 'ધ': 'dha', 'ન': 'na',
  'પ': 'pa', 'ફ': 'pha', 'બ': 'ba', 'ભ': 'bha', 'મ': 'ma',
  'ય': 'ya', 'ર': 'ra', 'લ': 'la', 'ળ': 'la', 'વ': 'va',
  'શ': 'sha', 'ષ': 'sha', 'સ': 'sa', 'હ': 'ha',

  // Vowels
  'અ': 'a', 'આ': 'a', 'ઇ': 'i', 'ઈ': 'i', 'ઉ': 'u', 'ઊ': 'u',
  'ઋ': 'ru', 'એ': 'e', 'ઐ': 'ai', 'ઓ': 'o', 'ઔ': 'au',

  // Vowel signs (matra) - need to handle multiple variations
  'ા': 'aa', 'િ': 'i', 'ી': 'ee', 'ુ': 'u', 'ૂ': 'oo',
  'ૃ': 'ru', 'ે': 'e', 'ૈ': 'ai', 'ો': 'o', 'ૌ': 'au',

  // Special characters
  'ં': 'n', 'ઃ': 'h', '઼': '', 'ૐ': 'om',

  // Numbers
  '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4',
  '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',

  // Additional common combinations
  'ક્ષ': 'ksh', 'જ્ઞ': 'gn',
};

/**
 * Converts Gujarati text to English transliteration
 * Example: "ટમેટા સૂપ" → "tameta sup"
 */
export function transliterateGujaratiToEnglish(text: string): string {
  let result = '';

  // Vowel matras (signs) that replace the inherent 'a'
  const matras = ['ા', 'િ', 'ી', 'ુ', 'ૂ', 'ૃ', 'ે', 'ૈ', 'ો', 'ૌ'];
  const halant = '્'; // Removes inherent 'a'

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = i < text.length - 1 ? text[i + 1] : '';

    // Check for special two-character combinations
    if (i < text.length - 1) {
      const twoChar = char + nextChar;
      if (gujaratiToEnglishMap[twoChar]) {
        result += gujaratiToEnglishMap[twoChar];
        i++; // Skip next character as we've processed it
        continue;
      }
    }

    // Single character mapping
    if (gujaratiToEnglishMap[char]) {
      let transliterated = gujaratiToEnglishMap[char];

      // If this is a consonant with inherent 'a' and next char is a matra or halant,
      // remove the 'a' before adding the matra
      if (transliterated.length >= 2 &&
          transliterated.endsWith('a') &&
          (matras.includes(nextChar) || nextChar === halant)) {
        // Remove the inherent 'a'
        transliterated = transliterated.slice(0, -1);
      }

      result += transliterated;
    } else {
      // Keep the character as-is if not in the map (e.g., spaces, punctuation)
      result += char;
    }
  }

  return result.toLowerCase();
}

/**
 * Removes optional 'a' sounds from transliterated text for flexible matching
 * Example: "paratha" → also matches "pratha", "barfi" → also matches "brfi"
 */
function removeOptionalA(text: string): string {
  // Remove 'a' that comes after consonants (flexible matching)
  return text.replace(/([bcdfghjklmnpqrstvwxyz])a/gi, '$1');
}

/**
 * Normalizes vowel variations for flexible matching
 * Example: "kheer" and "khir" both normalize to same pattern
 * Example: "soop" and "sup" both normalize to same pattern
 */
function normalizeVowels(text: string): string {
  return text
    .replace(/ee/gi, 'i')   // "kheer" → "khir", "paneer" → "panir"
    .replace(/oo/gi, 'u')   // "soop" → "sup", "food" → "fud"
    .replace(/aa/gi, 'a');  // "baat" → "bat"
}

/**
 * Normalizes consonant variations for flexible matching
 * Example: "corn" and "korn" both normalize to same pattern
 */
function normalizeConsonants(text: string): string {
  return text
    .replace(/c/gi, 'k')    // "corn" → "korn", "capsicum" → "kapsikum"
    .replace(/ph/gi, 'f')   // "phone" → "fone"
    .replace(/sh/gi, 's');  // "shak" → "sak" (optional)
}

/**
 * Searches for a query in Gujarati text (supports both English and Gujarati input)
 * Uses hybrid approach: direct match + dictionary lookup + transliteration
 * Example: searchInGujarati("ટમેટા સૂપ", "tameta soup") → true
 */
export function searchInGujarati(gujaratiText: string, query: string): boolean {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedGujarati = gujaratiText.toLowerCase().trim();

  // 1. Direct match (for Gujarati input)
  if (normalizedGujarati.includes(normalizedQuery)) {
    return true;
  }

  // Split query into words for multi-word search
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);

  // For single word queries, use the old logic (return on first match)
  if (queryWords.length === 1) {
    const word = queryWords[0];
    if (englishToGujaratiDict[word]) {
      const gujaratiEquivalents = englishToGujaratiDict[word];
      for (const gujaratiWord of gujaratiEquivalents) {
        if (normalizedGujarati.includes(gujaratiWord.toLowerCase())) {
          return true;
        }
      }
    }
  }

  // Pre-compute transliterations for efficiency
  const transliterated = transliterateGujaratiToEnglish(normalizedGujarati);
  const flexibleTransliterated = removeOptionalA(transliterated);
  const normalizedTransliterated = normalizeVowels(transliterated);
  const fullyFlexible = normalizeVowels(flexibleTransliterated);
  const consonantNormalized = normalizeConsonants(fullyFlexible);

  // 3. For single word queries, check various transliteration methods
  if (queryWords.length === 1) {
    const singleQuery = normalizedQuery;

    // Standard transliteration
    if (transliterated.includes(singleQuery)) {
      return true;
    }

    // Flexible match
    const flexibleQuery = removeOptionalA(singleQuery);
    if (flexibleTransliterated.includes(flexibleQuery)) {
      return true;
    }

    // Vowel-normalized match
    const normalizedSearchQuery = normalizeVowels(singleQuery);
    if (normalizedTransliterated.includes(normalizedSearchQuery)) {
      return true;
    }

    // Combined flexible + normalized match
    const fullyFlexibleQuery = normalizeVowels(flexibleQuery);
    if (fullyFlexible.includes(fullyFlexibleQuery)) {
      return true;
    }

    // Consonant-normalized match (c→k, ph→f, etc.)
    const consonantQuery = normalizeConsonants(fullyFlexibleQuery);
    if (consonantNormalized.includes(consonantQuery)) {
      return true;
    }

    return false;
  }

  // 4. Multi-word search: ALL words must match (AND logic)
  // Example: "panir batar" must find items with BOTH words
  const allWordsMatch = queryWords.every(word => {
    // Check direct Gujarati match
    if (normalizedGujarati.includes(word)) return true;

    // Check dictionary lookup
    if (englishToGujaratiDict[word]) {
      const matched = englishToGujaratiDict[word].some(gujWord =>
        normalizedGujarati.includes(gujWord.toLowerCase())
      );
      if (matched) return true;
    }

    // Check transliteration
    if (transliterated.includes(word)) return true;

    // Check flexible transliteration
    const flexWord = removeOptionalA(word);
    if (flexibleTransliterated.includes(flexWord)) return true;

    // Check vowel-normalized
    const normWord = normalizeVowels(word);
    if (normalizedTransliterated.includes(normWord)) return true;

    // Check combined flexible + normalized
    const fullyFlexWord = normalizeVowels(flexWord);
    if (fullyFlexible.includes(fullyFlexWord)) return true;

    // Check consonant-normalized
    const consonantWord = normalizeConsonants(fullyFlexWord);
    if (consonantNormalized.includes(consonantWord)) return true;

    return false;
  });

  return allWordsMatch;
}
