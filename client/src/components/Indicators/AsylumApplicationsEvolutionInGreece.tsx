import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useGreeceTotalApplications } from '@/hooks/useGreeceTotalApplications'
import type { AsylumApplicationRecord } from '@/hooks/useAsylumApplications'
import { AsylumApplicationsEvolutionInGreeceDetails } from '@/components/Indicators/AsylumApplicationsEvolutionInGreeceDetails'
import { Loading } from '../Loading'
import { ErrorMessage } from '../Caselaws/ErrorMessage'

export function AsylumApplicationsEvolutionInGreece() {
  const { records, loading, error } = useGreeceTotalApplications()
  return <AsylumApplicationsEvolutionInGreeceDetails records={records} loading={loading} error={error} />
}
