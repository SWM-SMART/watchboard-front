const DAY = 86400000;
const HOUR = 3600000;
const MINUTE = 60000;

/**
 * Generate time Difference string based on current time and input time
 *
 * @param {Date} [date] input time
 * @return {string} generated string
 */
export function timeDifference(date: Date): string {
  const diff = new Date().getTime() - date.getTime();
  if (diff >= DAY) return `${Math.floor(diff / DAY)}일 전에 수정됨`;
  if (diff >= HOUR) return `${Math.floor(diff / HOUR)}시간 전에 수정됨`;
  if (diff >= MINUTE) return `${Math.floor(diff / MINUTE)}분 전에 수정됨`;
  return `방금전에 수정됨`;
}
