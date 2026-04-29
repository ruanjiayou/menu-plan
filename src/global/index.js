import { startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, subDays, addDays, formatDate, } from 'date-fns'
import storage from '../utils/storage';
import { getDateRepeatedList, groupBy } from '../utils/index'
import { proxy } from 'valtio'
import { proxyMap } from 'valtio/utils'
import { App } from './App'
import { User } from './User'

const store = proxy({
  app: App,
  user: User,
  kinds: [],
  dishes: [],
  currentDateTime: new Date(),
  dateRecordsMap: proxyMap(),
  get daysInMonth() {
    const monthStart = startOfMonth(this.currentDateTime)
    const monthEnd = endOfMonth(this.currentDateTime)
    return eachDayOfInterval({ start: monthStart, end: monthEnd })
  },
  get this42day() {
    const monthStart = startOfMonth(this.currentDateTime);
    const start_of42 = subDays(monthStart, (monthStart.getDay() === 0 ? 7 : monthStart.getDay()) - 1);
    const end_of42 = addDays(start_of42, 41);
    return eachDayOfInterval({ start: start_of42, end: end_of42 })
  },
  get prev42day() {
    const monthStart = startOfMonth(subMonths(this.currentDateTime, 1));
    const start_of42 = subDays(monthStart, (monthStart.getDay() === 0 ? 7 : monthStart.getDay()) - 1);
    const end_of42 = addDays(start_of42, 41);
    return eachDayOfInterval({ start: start_of42, end: end_of42 })
  },
  get next42day() {
    const monthStart = startOfMonth(addMonths(this.currentDateTime, 1));
    const start_of42 = subDays(monthStart, (monthStart.getDay() === 0 ? 7 : monthStart.getDay()) - 1);
    const end_of42 = addDays(start_of42, 41);
    return eachDayOfInterval({ start: start_of42, end: end_of42 })
  },
  // 从本地操作    
  loadLocalRecords(datetime) {
    const start = startOfMonth(subMonths(datetime, 1));
    const end = endOfMonth(addMonths(datetime, 1))
    const arr = eachDayOfInterval(start, end);
    for (let i = 0; i < arr.length; i++) {
      const date = formatDate(arr[i], 'yyyy-MM-dd')
      const value = storage.getValue(date)
      this.dateRecordsMap.set(date, value ? JSON.parse(value) : [])
    }
  },// 记录管理
  setRecordsMap(dateDishes) {
    const map = groupBy(dateDishes, 'date');
    const that = this
    Object.keys(map).forEach(function (date) {
      storage.setValue(date, JSON.stringify(map[date]))
      that.dateRecordsMap.set(date, map[date]);
    });
  },
  // 更新某天数据
  setDateRecords(date, data) {
    storage.setValue(date, JSON.stringify(data))
    this.dateRecordsMap.set(date, data);
  },
  getDateRecords(date) {
    return this.dateRecordsMap.get(date);
  },
  addDateRecord(record) {
    let records = this.dateRecordsMap.get(record.date)
    if (!records) {
      this.dateRecordsMap.set(record.date, [])
      records = this.dateRecordsMap.get(record.date)
    }
    const arr = toJS(records);
    arr.push(record)
    records.push(record)
    storage.setValue(record.date, JSON.stringify(arr))
  },
  removeDateRecord(record) {
    const records = this.dateRecordsMap.get(record.date)
    if (records) {
      const arr = toJS(records)
      const idx = arr.findIndex(r => r.id === record.id)
      if (idx !== -1) {
        records.splice(idx, 1)
        arr.splice(idx, 1)
      }
      storage.setValue(record.date, JSON.stringify(arr))
    }
  },
  // 菜品管理
  setDishes(list) {
    this.dishes = list;
  },
  addDish(dish) {
    this.dishes.push(dish)
  },
  putDish(id, diff) {
    const dish = this.dishes.find(d => d.id === id);
    if (dish) {
      Object.keys(diff).forEach(k => {
        dish[k] = diff[k]
      })
    }
  },
  delDish(id) {
    const dish = this.dishes.find(v => v.id === id)
    if (dish) {
      this.dishes.remove(dish)
    }
  },
  // 分类管理
  setKinds(list) {
    this.kinds = list
  },
  addKind(kind) {
    this.kinds.push(kind)
  },
  delKind(id) {
    const kind = this.kinds.find(v => v.id === id)
    if (kind) {
      this.kinds.remove(kind)
    }
  },
  // 月份切换
  addMonth() {
    this.currentDateTime = addMonths(new Date(this.currentDateTime), 1)
  },
  subMonth() {
    this.currentDateTime = subMonths(new Date(this.currentDateTime), 1)
  }
});

export default store;