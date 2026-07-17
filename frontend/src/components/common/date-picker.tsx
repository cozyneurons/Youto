import {
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  DateInput,
  DatePicker as AriaDatePicker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  Popover
} from 'react-aria-components';
import type { DatePickerProps, DateValue } from 'react-aria-components';
import './date-picker.css';

export function DatePicker<T extends DateValue>(props: DatePickerProps<T>) {
  return (
    <AriaDatePicker {...props} className={`date-picker ${props.className || ''}`}>
      <Group className="date-picker-group">
        <DateInput className="date-input">
          {(segment) => <DateSegment segment={segment} className="date-segment" />}
        </DateInput>
        <Button className="date-picker-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </Button>
      </Group>
      <Popover className="date-picker-popover">
        <Dialog className="date-picker-dialog">
          <Calendar className="date-picker-calendar">
            <header className="calendar-header">
              <Button slot="previous" className="calendar-nav-btn">◀</Button>
              <Heading className="calendar-heading" />
              <Button slot="next" className="calendar-nav-btn">▶</Button>
            </header>
            <CalendarGrid className="calendar-grid">
              <CalendarGridHeader>
                {(day) => <CalendarHeaderCell className="calendar-header-cell">{day}</CalendarHeaderCell>}
              </CalendarGridHeader>
              <CalendarGridBody>
                {(date) => <CalendarCell date={date} className="calendar-cell" />}
              </CalendarGridBody>
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </AriaDatePicker>
  );
}
