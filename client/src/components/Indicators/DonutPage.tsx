import { useAsylumApplications } from '@/hooks/useAsylumApplications'
import type { AsylumApplicationRecord } from '@/hooks/useAsylumApplications'

export function DonutPage() {
  const { records, loading, error } = useAsylumApplications()
  return <DonutPageDetails records={records} loading={loading} error={error} />
}

function DonutPageDetails({ records, loading, error }: { records: AsylumApplicationRecord[], loading: boolean, error: string | null }) {
  console.log(records, loading, error)
  return (
    <div>Empty page</div>
  )
}
