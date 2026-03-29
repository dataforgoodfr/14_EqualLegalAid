import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { TableCell, TableRow } from '@/components/ui/table'
import type { MapIndicatorRecord } from '@/hooks/useMapIndicators'

const ELA_BLUE = '#1d4ed8'

const fmtInt = (n: number) => n.toLocaleString('en-US')
const fmtDec = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 })

const absoluteColumns: ColumnDef<MapIndicatorRecord>[] = [
  {
    accessorKey: 'name_country',
    header: 'Country',
  },
  {
    accessorKey: 'total_applicants',
    header: 'Total applicants',
    cell: ({ getValue }) => fmtInt(getValue<number>()),
  },
  {
    accessorKey: 'first_time_applicants',
    header: 'First-time',
    cell: ({ getValue }) => fmtInt(getValue<number>()),
  },
  {
    accessorKey: 'subsequent_applicants',
    header: 'Subsequent',
    cell: ({ getValue }) => fmtInt(getValue<number>()),
  },
]

const perCapitaColumns: ColumnDef<MapIndicatorRecord>[] = [
  {
    accessorKey: 'name_country',
    header: 'Country',
  },
  {
    accessorKey: 'total_applicants_per_capita',
    header: 'Total per capita',
    cell: ({ getValue }) => fmtDec(getValue<number>()),
  },
  {
    accessorKey: 'first_time_applicants_per_capita',
    header: 'First-time per capita',
    cell: ({ getValue }) => fmtDec(getValue<number>()),
  },
  {
    accessorKey: 'subsequent_applicants_per_capita',
    header: 'Subsequent per capita',
    cell: ({ getValue }) => fmtDec(getValue<number>()),
  },
]

interface Props {
  data: MapIndicatorRecord[]
  perCapita: boolean
}

export function IndicatorsDataTable({ data, perCapita }: Props) {
  const defaultSortKey = perCapita ? 'total_applicants_per_capita' : 'total_applicants'
  const [sorting, setSorting] = useState<SortingState>([{ id: defaultSortKey, desc: true }])

  const columns = useMemo(
    () => (perCapita ? perCapitaColumns : absoluteColumns),
    [perCapita],
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="h-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="sticky top-0 z-10" style={{ backgroundColor: ELA_BLUE }}>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="border-b">
              {headerGroup.headers.map(header => {
                const sorted = header.column.getIsSorted()
                const isCountry = header.column.id === 'name_country'
                return (
                  <th
                    key={header.id}
                    className={[
                      'h-10 px-2 align-middle font-medium whitespace-nowrap text-white',
                      isCountry ? 'text-left' : 'text-right',
                      header.column.getCanSort() ? 'cursor-pointer select-none' : '',
                    ].join(' ')}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {sorted === 'asc' ? ' ↑' : sorted === 'desc' ? ' ↓' : ''}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell
                  key={cell.id}
                  className={cell.column.id === 'name_country' ? 'font-medium' : 'text-right tabular-nums'}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </tbody>
      </table>
    </div>
  )
}
