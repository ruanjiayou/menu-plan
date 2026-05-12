import { useRef } from 'react'
import { startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, subDays, addDays, formatDate, } from 'date-fns'
import storage from '../utils/storage';
import { getDateRepeatedList, groupBy } from '../utils/index'
import { proxy, useSnapshot } from 'valtio'
import { proxyMap } from 'valtio/utils'
import { App } from './App'

export type IDish = {
  id: string;
  title: string;
  kind_id: string;
  sn: number;
  repeated?: boolean;
  kind?: IKind;
}
export type IKind = {
  id: string;
  title: string;
  sn: number;
}
export type IRecord = {
  id: string;
  date: string;
  time: Date;
  dish_id: string;
  sn: number;
  type: string;
  can_repeated?: number;
  repeated?: boolean;
  dish?: IDish;
}

export function useLocalProxy<T extends object>(initialState: T) {
  // 保持 proxy 引用不变
  const ref = useRef(proxy(initialState))
  // 订阅变化 - 这会自动触发重新渲染
  const snap = useSnapshot(ref.current)
  return [snap, ref.current] as const;
}

const kinds: IKind[] = [];
const dishes: IDish[] = []
const dateRecordsMap = new Map<string, IRecord[]>()
const store = proxy({
  app: App,
  kinds,
  dishes,
  currentDateTime: new Date(),
  today: formatDate(new Date(), 'yyyy-MM-dd'),
  dateRecordsMap: proxyMap(dateRecordsMap),
  get months() {
    const curr = formatDate(this.currentDateTime, 'yyyy-MM-dd');
    const prev = formatDate(subMonths(this.currentDateTime, 1), 'yyyy-MM-dd')
    const next = formatDate(addMonths(this.currentDateTime, 1), 'yyyy-MM-dd')
    return [prev, curr, next];
  },
  // 从本地操作    
  loadLocalRecords(datetime: Date) {
    const start = startOfMonth(subMonths(datetime, 1));
    const end = endOfMonth(addMonths(datetime, 1))
    const arr = eachDayOfInterval({ start, end });
    for (let i = 0; i < arr.length; i++) {
      const date = formatDate(arr[i]!, 'yyyy-MM-dd')
      const value = storage.getValue(date)
      this.dateRecordsMap.set(date, value ? JSON.parse(value) : [])
    }
  },// 记录管理
  setRecordsMap(dateDishes: IRecord[]) {
    const map: { [key: string]: IRecord[] } = groupBy(dateDishes, 'date');
    const that = this
    Object.keys(map).forEach(function (date) {
      storage.setValue(date, JSON.stringify(map[date]))
      that.dateRecordsMap.set(date, map[date]!);
    });
  },
  // 更新某天数据
  setDateRecords(date: string, data: IRecord[]) {
    storage.setValue(date, JSON.stringify(data))
    this.dateRecordsMap.set(date, data);
  },
  getDateRecords(date: string) {
    return this.dateRecordsMap.get(date);
  },
  addDateRecord(record: IRecord) {
    let records = this.dateRecordsMap.get(record.date) as IRecord[]
    if (!records) {
      this.dateRecordsMap.set(record.date, [])
      records = this.dateRecordsMap.get(record.date) as IRecord[]
    }
    records.push(record)
    storage.setValue(record.date, JSON.stringify(records))
  },
  removeDateRecord(record: IRecord) {
    const records = this.dateRecordsMap.get(record.date) as IRecord[]
    if (records) {
      const idx = records.findIndex(r => r.id === record.id)
      if (idx !== -1) {
        records.splice(idx, 1)
      }
      storage.setValue(record.date, JSON.stringify(records))
    }
  },
  // 菜品管理
  setDishes(list: IDish[]) {
    this.dishes = list;
  },
  addDish(dish: IDish) {
    this.dishes.push(dish)
  },
  putDish(id: string, diff: Partial<IDish>) {
    const dish = this.dishes.find(d => d.id === id);
    if (dish) {
      Object.keys(diff).forEach((k) => {
        //@ts-ignore
        dish[k] = diff[k]
      })
    }
  },
  delDish(id: string) {
    const idx = this.dishes.findIndex(v => v.id === id)
    if (idx !== -1) {
      this.dishes.splice(idx, 1)
    }
  },
  // 分类管理
  setKinds(list: IKind[]) {
    this.kinds = list
  },
  addKind(kind: IKind) {
    this.kinds.push(kind)
  },
  delKind(id: string) {
    const idx = this.kinds.findIndex(v => v.id === id)
    if (idx !== -1) {
      this.kinds.splice(idx, 1)
    }
  },
  // 月份切换
  addMonth() {
    this.currentDateTime = addMonths(new Date(this.currentDateTime), 1)
  },
  subMonth() {
    this.currentDateTime = subMonths(new Date(this.currentDateTime), 1)
  },
});

export default store;