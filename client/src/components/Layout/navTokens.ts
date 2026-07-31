/**
 * Jetons de la navigation des indicateurs.
 *
 * `navy` et `orange` sont les couleurs de marque relevées sur le site du client
 * (equallegalaid.org) : ce sont déjà celles du bandeau de titre `bg-[#093266]` et
 * du filet de HighlightTitle. Le handoff design proposait #12305F et #D2622D,
 * deux approximations — les valeurs de marque priment.
 *
 * Les deux teintes dérivées sont calculées à partir d'elles, pas reprises du
 * handoff : `navyDark` est le bleu assombri de 20 % (survol d'une pastille
 * active), `orangeLight` l'orange éclairci de 35 % vers le blanc, pour rester
 * lisible en petit corps sur fond marine.
 */
export const NAV_COLORS = {
  navy: '#093266',
  navyDark: '#072852',
  orange: '#D15F36',
  orangeLight: '#E1977C',
  textMuted: '#5A6472',
  labelMuted: '#8B94A1',
  mutedOnNavy: '#B7C2D4',
  pill: '#F1F3F6',
  pillHover: '#E4E8EE',
  border: '#E3E5E9',
} as const

/** Transition unique de la maquette, appliquée à tous les éléments interactifs. */
export const NAV_TRANSITION = 'all .15s cubic-bezier(.2,.8,.2,1)'
