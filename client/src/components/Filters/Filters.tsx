import {
  RiCalendarEventLine,
  RiArrowDownSLine,
} from '@remixicon/react'
import { Checkbox } from '../ui/checkbox'

export const Filters = () => {
  return (
    <div className="filter">
      <button className="filter__button">
        <RiCalendarEventLine />
        Decisions
        <RiArrowDownSLine />
      </button>
      <div
        className="filter__button"
      >
        <Checkbox></Checkbox>
      </div>
    </div>
  )
}
