/**
 * Palette de l'indicateur « Arrivals in Greece ».
 *
 * Source unique : les bulles de la carte, le classement, le graphique d'évolution
 * et le Sankey des voies d'entrée lisent tous ici. Sans ça, quatre représentations
 * des mêmes points d'entrée finissent avec quatre jeux de couleurs.
 *
 * Fichier séparé plutôt qu'un export depuis `ArrivalsGreeceDetails` : celui-ci
 * importe déjà le Sankey, l'import inverse formerait un cycle.
 *
 * ── Origine des teintes ─────────────────────────────────────────────────────
 * Charte du site : bleu foncé #003366, bleu clair #D1EFF9, orange #D15F36,
 * orange clair #FEB06A, vert #4A7C6F.
 *
 * La rampe insulaire interpole entre les deux bleus de la charte. Evros prend
 * l'orange : seule arrivée terrestre, la distinguer par la teinte plutôt que par
 * une nuance de bleu rend le découpage mer/terre lisible d'un coup d'œil.
 */

/**
 * Un cran par point d'entrée maritime, du plus soutenu au plus clair, dans un
 * ordre fixe. Volontairement indépendant des volumes : indexer la couleur sur le
 * classement ferait changer la teinte d'une île au moindre changement d'année.
 *
 * Evros prend l'orange de la charte `#D15F36` : c'est la seule arrivée terrestre,
 * et la distinguer par la teinte plutôt que par une nuance de bleu rend le
 * découpage mer/terre lisible d'un coup d'œil. L'ambre `#D97706` de la palette
 * camps ferait l'affaire visuellement, mais ne vient d'aucune charte.
 */
export const ENTRY_COLORS: Record<string, string> = {
  crete: '#1E6FA5',
  lesvos: '#6BB8E8',
  chios: '#8FC4E6',
  samos: '#9AD0F2',
  other_islands: '#B8DFF0',
  kos: '#C5E5F8',
  leros: '#D1EFF9',
  evros: '#D15F36',
}

/**
 * Teinte des agrégats insulaires — série « Sea » du découpage mer/terre, et nœuds
 * « Eastern Aegean » / « Sea arrivals » du Sankey.
 *
 * Bleu clair de la palette, laissé libre pour lui : c'est le grand aplat du
 * graphique d'évolution, où un bleu soutenu pèse trop face à l'ambre. Elle doit
 * rester distincte des îles — réutiliser la couleur de l'une d'elles donnerait à
 * l'agrégat l'apparence de cette île dans l'autre découpage — et distincte de la
 * Grèce, qui porte le bleu de la charte au bout du Sankey.
 */
export const SEA_COLOR = '#3F9FD8'

/** Les agrégats terrestres reprennent exactement Evros — c'est la même réalité. */
export const LAND_COLOR = ENTRY_COLORS.evros

/** Nœud terminal du Sankey : le bleu foncé de la charte, point de convergence. */
export const GREECE_COLOR = '#003366'
