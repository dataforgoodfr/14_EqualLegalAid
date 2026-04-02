import {
    Field,
    FieldContent,
    FieldGroup,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui'
import { useAppDispatch } from '@/hooks/reduxHook'
import { resetDateEnd, setDateEnd, setDateStart, setFilterTag } from '@/redux/filtersSlice'
import { DATE_FILTER_STATE_NAME, type DatePartSelection } from '@/types'

interface DateFilterItemProps {
    minDate: Date | null
    maxDate: Date | null
    startDate: DatePartSelection
    endDate: DatePartSelection
}

interface DateOption {
    month: number
    year: number
}

const MONTH_LABELS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]

const isCompleteDateSelection = (selection: DatePartSelection): selection is { month: number, year: number } => {
    return selection.month !== null && selection.year !== null
}

const compareDateParts = (left: DatePartSelection, right: DatePartSelection): number => {
    if (!isCompleteDateSelection(left) || !isCompleteDateSelection(right)) {
        return 0
    }

    if (left.year !== right.year) {
        return left.year - right.year
    }

    return left.month - right.month
}

const buildDateOptions = (minDate: Date | null, maxDate: Date | null): DateOption[] => {
    if (!minDate || !maxDate) {
        return []
    }

    const options: DateOption[] = []
    const current = new Date(Date.UTC(minDate.getUTCFullYear(), minDate.getUTCMonth(), 1))
    const last = new Date(Date.UTC(maxDate.getUTCFullYear(), maxDate.getUTCMonth(), 1))

    while (current.getTime() <= last.getTime()) {
        options.push({
            month: current.getUTCMonth(),
            year: current.getUTCFullYear(),
        })
        current.setUTCMonth(current.getUTCMonth() + 1)
    }

    return options
}

const getDateLabel = ({ month, year }: { month: number, year: number }) => {
    return `${MONTH_LABELS[month]} ${year}`
}

const toMonthValue = (month: number) => String(month)

const toYearValue = (year: number) => String(year)

const isMonthAvailable = (month: number | null, options: DateOption[], year: number | null) => {
    if (month === null || year === null) {
        return false
    }

    return options.some(option => option.year === year && option.month === month)
}

export const DateFilterItem = ({
    minDate,
    maxDate,
    startDate,
    endDate,
}: DateFilterItemProps) => {
    const dispatch = useAppDispatch()
    const allOptions = buildDateOptions(minDate, maxDate)

    const availableEndOptions = isCompleteDateSelection(startDate)
        ? allOptions.filter(option => compareDateParts(option, startDate) >= 0)
        : allOptions

    const startYears = [...new Set(allOptions.map(option => option.year))]
    const endYears = [...new Set(availableEndOptions.map(option => option.year))]

    const startMonths = startDate.year === null
        ? []
        : allOptions.filter(option => option.year === startDate.year)

    const endMonths = endDate.year === null
        ? []
        : availableEndOptions.filter(option => option.year === endDate.year)

    const updateStartTag = (selection: DatePartSelection) => {
        if (!isCompleteDateSelection(selection)) {
            dispatch(setFilterTag({
                item: {
                    filterStateName: DATE_FILTER_STATE_NAME,
                    id: 'date-start',
                    name: '',
                },
                itemChecked: false,
            }))
            return
        }

        dispatch(setFilterTag({
            item: {
                filterStateName: DATE_FILTER_STATE_NAME,
                id: 'date-start',
                name: `From ${getDateLabel(selection)}`,
            },
            itemChecked: true,
        }))
    }

    const updateEndTag = (selection: DatePartSelection) => {
        if (!isCompleteDateSelection(selection)) {
            dispatch(setFilterTag({
                item: {
                    filterStateName: DATE_FILTER_STATE_NAME,
                    id: 'date-end',
                    name: '',
                },
                itemChecked: false,
            }))
            return
        }

        dispatch(setFilterTag({
            item: {
                filterStateName: DATE_FILTER_STATE_NAME,
                id: 'date-end',
                name: `Until ${getDateLabel(selection)}`,
            },
            itemChecked: true,
        }))
    }

    const resetEndSelection = () => {
        dispatch(resetDateEnd())
        updateEndTag({ month: null, year: null })
    }

    const handleStartYearChange = (yearValue: string) => {
        const year = Number(yearValue)
        const nextSelection: DatePartSelection = {
            year,
            month: isMonthAvailable(startDate.month, allOptions, year) ? startDate.month : null,
        }

        dispatch(setDateStart(nextSelection))
        updateStartTag(nextSelection)

        if (isCompleteDateSelection(endDate) && isCompleteDateSelection(nextSelection) && compareDateParts(endDate, nextSelection) < 0) {
            resetEndSelection()
        }
    }

    const handleStartMonthChange = (monthValue: string) => {
        const nextSelection: DatePartSelection = {
            ...startDate,
            month: Number(monthValue),
        }

        dispatch(setDateStart(nextSelection))
        updateStartTag(nextSelection)

        if (isCompleteDateSelection(endDate) && isCompleteDateSelection(nextSelection) && compareDateParts(endDate, nextSelection) < 0) {
            resetEndSelection()
        }
    }

    const handleEndYearChange = (yearValue: string) => {
        const year = Number(yearValue)
        const nextSelection: DatePartSelection = {
            year,
            month: isMonthAvailable(endDate.month, availableEndOptions, year) ? endDate.month : null,
        }

        dispatch(setDateEnd(nextSelection))
        updateEndTag(nextSelection)
    }

    const handleEndMonthChange = (monthValue: string) => {
        const nextSelection: DatePartSelection = {
            ...endDate,
            month: Number(monthValue),
        }

        dispatch(setDateEnd(nextSelection))
        updateEndTag(nextSelection)
    }

    const isDisabled = allOptions.length === 0

    return (
        <div className="filter-item p-2">
            <div className="filter-item__content rounded-md border border-gray-200 bg-white px-4 py-4">
                <FieldGroup className="gap-5">
                    <Field className="rounded-md ">
                        <FieldContent>
                            <Label>Start date</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <Select
                                    disabled={isDisabled}
                                    value={startDate.year !== null ? toYearValue(startDate.year) : undefined}
                                    onValueChange={handleStartYearChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {startYears.map(year => (
                                            <SelectItem key={year} value={toYearValue(year)}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    disabled={isDisabled || startDate.year === null}
                                    value={startDate.month !== null ? toMonthValue(startDate.month) : undefined}
                                    onValueChange={handleStartMonthChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {startMonths.map(option => (
                                            <SelectItem key={`${option.year}-${option.month}`} value={toMonthValue(option.month)}>
                                                {MONTH_LABELS[option.month]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </FieldContent>
                    </Field>
                    <Field className="rounded-md">
                        <FieldContent>
                            <Label>End date</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <Select
                                    disabled={isDisabled}
                                    value={endDate.year !== null ? toYearValue(endDate.year) : undefined}
                                    onValueChange={handleEndYearChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {endYears.map(year => (
                                            <SelectItem key={year} value={toYearValue(year)}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    disabled={isDisabled || endDate.year === null}
                                    value={endDate.month !== null ? toMonthValue(endDate.month) : undefined}
                                    onValueChange={handleEndMonthChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {endMonths.map(option => (
                                            <SelectItem key={`${option.year}-${option.month}`} value={toMonthValue(option.month)}>
                                                {MONTH_LABELS[option.month]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </FieldContent>
                    </Field>
                </FieldGroup>
            </div>
        </div>
    )
}