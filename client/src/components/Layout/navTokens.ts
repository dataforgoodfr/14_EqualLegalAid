/**
 * Jetons de la navigation des indicateurs.
 *
 * `navy` et `orange` sont les couleurs de la charte du site : #003366 et #D15F36.
 * Ce sont celles du bandeau de titre `bg-[#003366]` et du filet de HighlightTitle.
 *
 * Les deux teintes dérivées sont calculées à partir d'elles, pas reprises du
 * handoff : `navyDark` est le bleu assombri de 20 % (survol d'une pastille
 * active), `orangeLight` l'orange éclairci de 35 % vers le blanc, pour rester
 * lisible en petit corps sur fond marine.
 */
export const NAV_COLORS = {
  navy: '#003366',
  navyDark: '#002952',
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
