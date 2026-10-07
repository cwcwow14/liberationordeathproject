// Lines used by the slogan ticker and the quote-card maker. Edit freely.

export const TICKER_SLOGANS = [
  "Compassion isn't radical — exploitation is",
  'The earth does not belong to us',
  'We belong to the earth',
  'Liberation or death',
  'Not a slogan — a choice',
  'Animals are not property',
  'No more greenwashing',
]

export type Quote = { id: string; text: string; source: string }

export const QUOTES: Quote[] = [
  { id: 'belong', text: 'The earth does not belong to us. We belong to the earth.', source: 'LOD Manifesto' },
  { id: 'compassion', text: "Compassion isn't radical. Exploitation is.", source: '@liberationord3ath' },
  { id: 'choice', text: 'Liberation or Death is not a slogan. It is a choice.', source: 'LOD Manifesto' },
  { id: 'silent', text: 'Our planet is burning, our animals are suffering, and our future is being sold for profit. We refuse to be silent.', source: 'LOD Manifesto' },
  { id: 'property', text: 'Sentient beings are not resources, not property, not products.', source: 'LOD Manifesto' },
  { id: 'gdp', text: 'Measure success not in GDP, but in the health of ecosystems and the wellbeing of all living creatures.', source: 'LOD Manifesto' },
  { id: 'greenwashing', text: 'Not greenwashing. Not carbon credits. Not half-measures.', source: 'LOD Manifesto' },
  { id: 'polite', text: 'The time for polite conversation is over.', source: 'LOD Manifesto' },
]
