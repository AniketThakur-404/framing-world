/**
 * Fuzzy search, Damerau-Levenshtein distance, token similarity, and spelling correction algorithms.
 */

// Framing and printing synonyms & common spellings
export const SYNONYM_MAP: Record<string, string[]> = {
  frame: ["frames", "framing", "photo frame", "picture frame"],
  frames: ["frame", "framing"],
  framing: ["frame", "frames"],
  moulding: ["molding", "mouldings", "moldings", "profile"],
  mouldings: ["moulding", "molding", "moldings"],
  molding: ["moulding", "mouldings", "moldings"],
  moldings: ["molding", "moulding", "mouldings"],
  print: ["prints", "printing", "poster"],
  prints: ["print", "printing"],
  printing: ["print", "prints"],
  canvas: ["canvas print", "stretched", "stretcher"],
  acrylic: ["arcylic", "glass print", "plexi", "perspex"],
  glass: ["glazing", "acrylic"],
  glazing: ["glass", "acrylic"],
  wooden: ["wood", "timber"],
  wood: ["wooden", "timber"],
  metal: ["aluminium", "aluminum", "steel"],
  gallery: ["gallery wall", "wall gallery", "set"],
  wall: ["gallery", "wall art", "wall frame"],
  art: ["artwork", "painting", "fine art"],
  artwork: ["art", "painting"],
  photo: ["photograph", "picture", "photos"],
  picture: ["photo", "photograph"],
  mount: ["mat", "matting", "mount board", "passepartout"],
  archival: ["giclee", "fine art", "museum"],
  black: ["charcoal", "dark", "noir"],
  white: ["ivory", "cream", "light"],
  brown: ["walnut", "teak", "wood"],
  gold: ["golden", "gilded", "gilt"],
  golden: ["gold", "gilded"],
}

/**
 * Calculates Damerau-Levenshtein distance between two strings,
 * which accounts for insertions, deletions, substitutions, and adjacent transpositions (e.g. 'balck' <-> 'black').
 */
export function damerauLevenshteinDistance(source: string, target: string): number {
  if (source === target) return 0
  const s = source.toLowerCase()
  const t = target.toLowerCase()

  const sLen = s.length
  const tLen = t.length

  if (!sLen) return tLen
  if (!tLen) return sLen

  const d: number[][] = []

  for (let i = 0; i <= sLen; i++) {
    d[i] = [i]
  }

  for (let j = 0; j <= tLen; j++) {
    d[0][j] = j
  }

  for (let i = 1; i <= sLen; i++) {
    for (let j = 1; j <= tLen; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1

      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      )

      // Transposition check (e.g. 'ba' vs 'ab')
      if (
        i > 1 &&
        j > 1 &&
        s[i - 1] === t[j - 2] &&
        s[i - 2] === t[j - 1]
      ) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }

  return d[sLen][tLen]
}

/**
 * Calculates normalized similarity ratio between 0 and 1.
 */
export function stringSimilarity(a: string, b: string): number {
  const s1 = a.toLowerCase().trim()
  const s2 = b.toLowerCase().trim()

  if (s1 === s2) return 1.0
  if (!s1.length || !s2.length) return 0.0

  // If one contains the other as substring, give high similarity boost
  if (s1.includes(s2) || s2.includes(s1)) {
    const minLen = Math.min(s1.length, s2.length)
    const maxLen = Math.max(s1.length, s2.length)
    return Math.max(0.75, minLen / maxLen)
  }

  const maxLen = Math.max(s1.length, s2.length)
  const distance = damerauLevenshteinDistance(s1, s2)
  return Math.max(0, 1 - distance / maxLen)
}

/**
 * Checks if query word is close to target word allowing for typos:
 * - 1-2 chars: must be exact match or prefix
 * - 3-5 chars: allow 1 typo / transposition (distance <= 1)
 * - 6+ chars: allow up to 2 typos / transpositions (distance <= 2)
 */
export function isFuzzyMatch(queryWord: string, targetWord: string): boolean {
  const q = queryWord.toLowerCase().trim()
  const t = targetWord.toLowerCase().trim()

  if (!q || !t) return false
  if (t === q || t.includes(q) || q.includes(t)) return true

  if (q.length <= 2) return false

  const maxDistance = q.length <= 5 ? 1 : 2
  const distance = damerauLevenshteinDistance(q, t)

  return distance <= maxDistance
}

/**
 * Returns spelling suggestions from dictionary words based on best similarity.
 */
export function findSpellingSuggestion(
  query: string,
  dictionary: string[]
): string | null {
  const cleanQuery = query.toLowerCase().trim()
  if (!cleanQuery || cleanQuery.length < 3) return null

  const queryWords = cleanQuery.split(/\s+/).filter(Boolean)
  let hasCorrection = false

  const correctedWords = queryWords.map((qWord) => {
    // 1. If word already exists exactly in dictionary, keep it
    if (dictionary.some((w) => w.toLowerCase() === qWord)) {
      return qWord
    }

    // 2. Check synonyms
    if (SYNONYM_MAP[qWord]) {
      for (const syn of SYNONYM_MAP[qWord]) {
        if (dictionary.some((w) => w.toLowerCase() === syn)) {
          hasCorrection = true
          return syn
        }
      }
    }

    // 3. Check fuzzy matches against dictionary with Damerau-Levenshtein
    let bestMatch: string | null = null
    let bestScore = 0

    for (const dictWord of dictionary) {
      const dWord = dictWord.toLowerCase()

      // Quick distance check
      const dist = damerauLevenshteinDistance(qWord, dWord)
      const allowedDist = qWord.length <= 5 ? 1 : 2

      if (dist <= allowedDist) {
        const similarity = stringSimilarity(qWord, dWord)
        if (similarity > bestScore) {
          bestScore = similarity
          bestMatch = dictWord
        }
      }
    }

    if (bestMatch && bestMatch.toLowerCase() !== qWord) {
      hasCorrection = true
      return bestMatch.toLowerCase()
    }

    return qWord
  })

  if (hasCorrection) {
    const suggestion = correctedWords.join(" ")
    return suggestion !== cleanQuery ? suggestion : null
  }

  return null
}
