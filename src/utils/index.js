import { addDays, formatDate } from "date-fns";

export function getDateRepeatedList(date, map) {
  const dish_ids = new Set();
  const repeats = new Set();
  const todayDate = new Date(date);
  for (let i = -7; i <= 7; i++) {
    const currDate = formatDate(addDays(todayDate, i), 'yyyy-MM-dd')
    const ids = (map.get(currDate) || []).map(v => v.dish_id);
    ids.map(id => {
      if (dish_ids.has(id)) {
        repeats.add(id);
      } else {
        dish_ids.add(id)
      }
    })
  }
  return Array.from(repeats);
}

