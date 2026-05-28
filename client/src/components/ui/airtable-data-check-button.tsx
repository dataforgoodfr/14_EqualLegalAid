export function AirtableDataCheckButton({ records, loading, error }: { records: unknown, loading: boolean, error: string | null }) {
  return (
    <div className="loading">
      <button
        className="rounded-md border"
        onClick={() => {
          console.log({ records })
          console.log({ loading })
          console.log({ error })
        }}
      >
        AirTable Data Checking Button
      </button>
    </div>
  )
}
