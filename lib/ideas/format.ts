export const IDEAS_TIME_ZONE = 'Asia/Tokyo'

/**
 * Formats an ISO timestamp as `yyyy.MM.dd HH:mm` in a fixed time zone.
 * Formatting happens in `getStaticProps`, so the markup is identical on the
 * server and in the browser regardless of where either one runs.
 */
export function formatIdeaTimestamp(
  iso: string,
  timeZone: string = IDEAS_TIME_ZONE
): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  } as Intl.DateTimeFormatOptions).formatToParts(new Date(iso))
  const get = (type: string) =>
    parts.filter((part) => part.type === type)[0]?.value ?? ''
  return `${get('year')}.${get('month')}.${get('day')} ${get('hour')}:${get('minute')}`
}
