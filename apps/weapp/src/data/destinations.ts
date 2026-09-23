export interface Destination {
  code: string
  flag: string
  nameKey: string
}

export const destinations: Destination[] = [
  { code: 'japan', flag: '🇯🇵', nameKey: 'home.destinations.japan' },
  { code: 'south_korea', flag: '🇰🇷', nameKey: 'home.destinations.south_korea' },
  { code: 'schengen_fr', flag: '🇫🇷', nameKey: 'home.destinations.schengen_fr' },
  { code: 'schengen_de', flag: '🇩🇪', nameKey: 'home.destinations.schengen_de' },
  { code: 'schengen_it', flag: '🇮🇹', nameKey: 'home.destinations.schengen_it' },
  { code: 'united_states', flag: '🇺🇸', nameKey: 'home.destinations.united_states' }
]
