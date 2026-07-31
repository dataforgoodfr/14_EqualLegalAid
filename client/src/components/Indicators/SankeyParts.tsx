/**
 * Rendu partagé des diagrammes de Sankey.
 *
 * Recharts ne dessine que des rectangles nus : sans nœud personnalisé, le diagramme
 * n'a aucune étiquette. Les sources reçoivent leur libellé à gauche, les destinations
 * à droite, d'où les marges latérales généreuses attendues côté appelant.
 *
 * `maxDepth` et `midShift` sont passés par l'appelant : recharts les recopie tels
 * quels sur chaque nœud et chaque ruban.
 */

/** Marges à passer au `<Sankey>` — les libellés débordent du cadre de tracé. */
export const SANKEY_MARGIN = { top: 34, right: 130, bottom: 30, left: 130 }

export function SankeyNode(props: any) {
  const { y, width, height, payload, maxDepth, midShift } = props
  // Recharts répartit les colonnes à intervalles égaux. Les niveaux intermédiaires
  // sont poussés vers la droite : leurs rubans sortants sont courts et épais, ceux
  // qui entrent doivent traverser la forêt de libellés de sources.
  const depth = payload?.depth ?? 0
  const isMid = depth > 0 && depth < (maxDepth ?? 1)
  const x = props.x + (isMid ? midShift ?? 0 : 0)
  // `depth` plutôt qu'une comparaison à containerWidth : recharts ne transmet pas
  // toujours cette largeur au nœud personnalisé, et le libellé basculait à droite.
  const isSource = depth === 0
  const color = payload.nodeColor ?? '#94a3b8'
  const value = Number(payload.value ?? 0).toLocaleString('fr-FR')

  // Niveau intermédiaire : les deux flancs du nœud sont occupés par des rubans,
  // le libellé se pose donc au-dessus.
  if (isMid) {
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={color} rx={2} />
        <text x={x + width / 2} y={y - 15} textAnchor="middle" fontSize={11} fill="#334155">
          {payload.name}
        </text>
        <text x={x + width / 2} y={y - 4} textAnchor="middle" fontSize={10} fill="#94a3b8">
          {value}
        </text>
      </g>
    )
  }

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} rx={2} />
      <text
        x={isSource ? x - 8 : x + width + 8}
        y={y + height / 2}
        textAnchor={isSource ? 'end' : 'start'}
        dominantBaseline="middle"
        fontSize={11}
        fill="#334155"
      >
        {payload.name}
      </text>
      <text
        x={isSource ? x - 8 : x + width + 8}
        y={y + height / 2 + 13}
        textAnchor={isSource ? 'end' : 'start'}
        dominantBaseline="middle"
        fontSize={10}
        fill="#94a3b8"
      >
        {value}
      </text>
    </g>
  )
}

/** Ruban coloré d'après sa source, sinon les flux se confondent. */
export function SankeyLink(props: any) {
  const { sourceY, targetY, linkWidth, payload, maxDepth, midShift } = props
  const color = payload?.source?.nodeColor ?? '#94a3b8'
  // Les extrémités suivent le décalage appliqué aux nœuds intermédiaires, sinon les
  // rubans se décrocheraient de leur nœud.
  const isMid = (d: number) => d > 0 && d < (maxDepth ?? 1)
  const shift = midShift ?? 0
  const sourceX = props.sourceX + (isMid(payload?.source?.depth ?? 0) ? shift : 0)
  const targetX = props.targetX + (isMid(payload?.target?.depth ?? 0) ? shift : 0)
  // Points de contrôle recalculés à mi-distance : ceux de recharts se rapportent aux
  // positions d'avant décalage et tordraient la courbe.
  const mid = (sourceX + targetX) / 2
  return (
    <path
      d={`M${sourceX},${sourceY}C${mid},${sourceY} ${mid},${targetY} ${targetX},${targetY}`}
      fill="none"
      stroke={color}
      strokeWidth={linkWidth}
      strokeOpacity={0.4}
    />
  )
}

/**
 * Décalage horizontal des niveaux intermédiaires, proportionnel à la largeur
 * mesurée — un décalage fixe collerait la colonne à la destination sur écran
 * étroit. Plafonné : au-delà, les rubans du dernier tronçon deviennent trop
 * courts pour se lire.
 */
export function midShiftFor(wrapWidth: number, maxDepth: number) {
  // Au-delà d'un seul niveau intermédiaire, les colonnes sont déjà serrées : les
  // décaler toutes du même pas écraserait le dernier tronçon.
  if (maxDepth !== 2) return 0
  return Math.min(170, Math.max(0, (wrapWidth - 260) * 0.22))
}
