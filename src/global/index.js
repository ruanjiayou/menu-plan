import { useRef } from 'react'
import { startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, subDays, addDays, formatDate, } from 'date-fns'
import storage from '../utils/storage';
import { getDateRepeatedList, groupBy } from '../utils/index'
import { proxy, useSnapshot } from 'valtio'
import { proxyMap } from 'valtio/utils'
import { App } from './App'
import { User } from './User'

/**
 * @template T
 * @param {T} initialState - 初始状态对象
 * @returns {[T, T]} [localState, localProxy] - 快照和代理对象
 */
export function useLocalProxy(initialState) {
  // 保持 proxy 引用不变
  const ref = useRef()

  if (!ref.current) {
    ref.current = proxy(initialState)
  }

  // 订阅变化 - 这会自动触发重新渲染
  const snap = useSnapshot(ref.current)

  return [snap, ref.current]
}

const store = proxy({
  app: App,
  user: User,
  kinds: [],
  dishes: [],
  currentDateTime: new Date(),
  today: formatDate(new Date(), 'yyyy-MM-dd'),
  dateRecordsMap: proxyMap(),
  get months() {
    const curr = formatDate(this.currentDateTime, 'yyyy-MM-dd');
    const prev = formatDate(subMonths(this.currentDateTime, 1), 'yyyy-MM-dd')
    const next = formatDate(addMonths(this.currentDateTime, 1), 'yyyy-MM-dd')
    return [prev, curr, next];
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
    records.push(record)
    storage.setValue(record.date, JSON.stringify(records))
  },
  removeDateRecord(record) {
    const records = this.dateRecordsMap.get(record.date)
    if (records) {
      const idx = records.findIndex(r => r.id === record.id)
      if (idx !== -1) {
        records.splice(idx, 1)
      }
      storage.setValue(record.date, JSON.stringify(records))
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
  },
  logout() {
    this.user.profile = null;
    this.user.access_token = '';
    this.user.refresh_token = '';
  }
});

export default store;