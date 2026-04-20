import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, subDays, addDays, formatDate, } from 'date-fns'
import { toJS } from 'mobx';
import { getSnapshot, types, cast } from 'mobx-state-tree'

const Kind = types.model('Kind', {
  id: types.string,
  title: types.string,
  sn: types.number,
})

const Dish = types.model('Dish', {
  id: types.string,
  title: types.string,
  kind_id: types.string,
  sn: types.number,
  kind: types.maybe(Kind)
})

const Record = types.model('Record', {
  id: types.string,
  dish_id: types.string,
  date: types.string,
  can_repeated: types.number,
  sn: types.number,
  type: types.string,
  dish: types.maybe(Dish),
  repeated: types.optional(types.boolean, false)
})

const Store = types.model('Store', {
  dateRecordsMap: types.map(types.array(Record)),
  user: types.frozen({}),
  app: types.model({
    baseURL: types.string,
  }),
  kinds: types.array(Kind),
  dishes: types.array(Dish),
  currentDateTime: types.Date
}).views(self => ({
  // 日期处理
  get daysInMonth() {
    const monthStart = startOfMonth(self.currentDateTime)
    const monthEnd = endOfMonth(self.currentDateTime)
    return eachDayOfInterval({ start: monthStart, end: monthEnd })
  },
  get prev_days() {
    const start = startOfMonth(self.currentDateTime)
    const count = start.getDay() - 1
    const offset = count < 0 ? 7 + count : count;
    const results = [];
    for (let i = 1; i <= offset; i++) {
      results.push(formatDate(subDays(start, i), 'dd'))
    }
    return results.reverse();
  },
  get next_days() {
    const start = startOfMonth(self.currentDateTime)
    const end = endOfMonth(self.currentDateTime);
    const count = start.getDay() - 1
    const real_prev = count < 0 ? 7 + count : count;
    const offset = 42 - real_prev - end.getDate()
    const results = [];
    for (let i = 1; i <= offset; i++) {
      results.push(format(addDays(end, i), 'd'))
    }
    return results
  },
  get this42day() {
    const monthStart = startOfMonth(self.currentDateTime);
    const start_of42 = subDays(monthStart, (monthStart.getDay() === 0 ? 7 : monthStart.getDay()) - 1);
    const end_of42 = addDays(start_of42, 41);
    return eachDayOfInterval({ start: start_of42, end: end_of42 })
  },
  get prev42day() {
    const monthStart = startOfMonth(subMonths(self.currentDateTime, 1));
    const start_of42 = subDays(monthStart, (monthStart.getDay() === 0 ? 7 : monthStart.getDay()) - 1);
    const end_of42 = addDays(start_of42, 41);
    return eachDayOfInterval({ start: start_of42, end: end_of42 })
  },
  get next42day() {
    const monthStart = startOfMonth(addMonths(self.currentDateTime, 1));
    const start_of42 = subDays(monthStart, (monthStart.getDay() === 0 ? 7 : monthStart.getDay()) - 1);
    const end_of42 = addDays(start_of42, 41);
    return eachDayOfInterval({ start: start_of42, end: end_of42 })
  }
})).actions(self => ({
  // 记录管理
  resetRecordsMap(dateDishes) {
    const map = {};
    dateDishes.forEach(v => {
      if (!map[v.date]) {
        map[v.date] = []
      }
      map[v.date].push(v)
    })
    self.dateRecordsMap.replace(map)
  },
  setDateDish(date, data) {
    self.dateRecordsMap.set(date, cast(data));
  },
  getDateList(date) {
    return toJS(self.dateRecordsMap.get(date)) || [];
  },
  addDateRecord(record) {
    let records = self.dateRecordsMap.get(record.date)
    console.log(record, records)
    if (!records) {
      self.dateRecordsMap.set(record.date, cast([]))
      records = self.dateRecordsMap.get(record.date)
    }
    records.push(record)
  },
  removeDateRecord(record) {
    const records = self.dateRecordsMap.get(record.date)
    console.log(records)
    if (records) {
      const idx = records.findIndex(r => r.id === record.id)
      console.log(idx)
      if (idx !== -1) {
        records.splice(idx, 1)
        self.dateRecordsMap.set(record.date, records)
      }
    }
  }
})).actions(self => ({
  // 菜品管理
  setDishes(list) {
    self.dishes = list;
  },
  addDish(dish) {
    self.dishes.push(dish)
  },
  delDish(id) {
    const dish = self.dishes.find(v => v.id === id)
    if (dish) {
      self.dishes.remove(dish)
    }
  }
})).actions(self => ({
  // 分类管理
  setKinds(list) {
    self.kinds = list
  },
  addKind(kind) {
    self.kinds.push(kind)
  },
  delKind(id) {
    const kind = self.kinds.find(v => v.id === id)
    if (kind) {
      self.kinds.remove(kind)
    }
  }
})).actions(self => ({
  addMonth() {
    self.currentDateTime = addMonths(self.currentDateTime, 1)
  },
  subMonth() {
    self.currentDateTime = subMonths(self.currentDateTime, 1)
  }
}));

export const store = Store.create({
  app: { baseURL: 'http://localhost:3006' },
  DateDish: {},
  kinds: [],
  dishes: [],
  currentDateTime: new Date()
});
