import { startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, subDays, addDays, formatDate, } from 'date-fns'
import { toJS } from 'mobx';
import { types, cast } from 'mobx-state-tree'
import storage from '../utils/storage';
import { getDateRepeatedList, groupBy } from '../utils/index'

import { App } from './App';
import { User } from './User';
import { Kind } from './Kind';
import { Dish } from './Dish';
import { Record } from './Record';

const Store = types.model('Store', {
  app: App,
  user: User,
  kinds: types.array(Kind),
  dishes: types.array(Dish),
  currentDateTime: types.Date,
  dateRecordsMap: types.map(types.array(Record)),
}).views(self => ({
  // 日期处理
  get daysInMonth() {
    const monthStart = startOfMonth(self.currentDateTime)
    const monthEnd = endOfMonth(self.currentDateTime)
    return eachDayOfInterval({ start: monthStart, end: monthEnd })
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
}))
  .actions(self => ({// 从本地操作    
    loadLocalRecords(datetime) {
      const start = startOfMonth(subMonths(datetime, 1));
      const end = endOfMonth(addMonths(datetime, 1))
      const arr = eachDayOfInterval(start, end);
      for (let i = 0; i < arr.length; i++) {
        const date = formatDate(arr[i], 'yyyy-MM-dd')
        const value = storage.getValue(date)
        self.dateRecordsMap.set(date, value ? JSON.parse(value) : [])
      }
    },
  }))
  .actions(self => ({ // 记录管理
    setRecordsMap(dateDishes) {
      const map = groupBy(dateDishes, 'date');
      Object.keys(map).forEach(date => {
        storage.setValue(date, JSON.stringify(map[date]))
        self.dateRecordsMap.set(date, map[date]);
      });
    },
    // 更新某天数据
    setDateRecords(date, data) {
      storage.setValue(date, JSON.stringify(data))
      self.dateRecordsMap.set(date, cast(data));
    },
    getDateRecords(date) {
      return self.dateRecordsMap.get(date) || [];
    },
    addDateRecord(record) {
      let records = self.dateRecordsMap.get(record.date)
      if (!records) {
        self.dateRecordsMap.set(record.date, cast([]))
        records = self.dateRecordsMap.get(record.date)
      }
      const arr = toJS(records);
      arr.push(record)
      records.push(cast(record))
      storage.setValue(record.date, JSON.stringify(arr))
    },
    removeDateRecord(record) {
      const records = self.dateRecordsMap.get(record.date)
      if (records) {
        const arr = toJS(records)
        const idx = arr.findIndex(r => r.id === record.id)
        if (idx !== -1) {
          records.splice(idx, 1)
          arr.splice(idx, 1)
        }
        storage.setValue(record.date, JSON.stringify(arr))
      }
    }
  }))
  .actions(self => ({
    calc_repeat(datetime) {
      const start = startOfMonth(datetime).getDate()
      const end = endOfMonth(datetime).getDate()
      for (let i = start; i <= end; i++) {
        const date = formatDate(addDays(datetime, i), 'yyyy-MM-dd');
        const repeats = getDateRepeatedList(date, self.dateRecordsMap)
        const records = self.dateRecordsMap.get(date);
        if (records) {
          records.forEach(record => {
            record.repeated = repeats.includes(record.dish_id)
          })
        }
      }
    }
  }))
  .actions(self => ({ // 菜品管理
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
  }))
  .actions(self => ({ // 分类管理
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
  }))
  .actions(self => ({ // 月份切换
    addMonth() {
      self.currentDateTime = addMonths(self.currentDateTime, 1)
    },
    subMonth() {
      self.currentDateTime = subMonths(self.currentDateTime, 1)
    }
  }));

const profile = storage.getValue('profile');
export default Store.create({
  app: App.create({ baseURL: '' }),
  user: User.create({
    profile: profile ? JSON.parse(profile) : undefined,
    access_token: storage.getValue('access_token') || '',
    refresh_token: storage.getValue('refresh_token') || '',
  }),
  kinds: [],
  dishes: [],
  currentDateTime: new Date(),
  dateRecordsMap: {},
});
