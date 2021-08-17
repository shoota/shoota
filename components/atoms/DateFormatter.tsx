import React from 'react'
import { parseISO, format } from 'date-fns'

type Props = {
  dateString: string
}

const DateFormatter: React.FC<Props> = ({ dateString }) => {
  const date = parseISO(dateString)
  return <time dateTime={dateString}>{format(date, 'yyyy, M/d')}</time>
}

export default DateFormatter
