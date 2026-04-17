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
})

const DateDish = types.model('DateDish', {
  id: types.string,
  dish_id: types.string,
  can_repeated: types.number,
  sn: types.number,
  type: types.string,
  dish: types.maybe(Dish),
  repeated: types.optional(types.boolean, false)
})

const Store = types.model('Store', {
  monthDateDish: types.map(types.array(DateDish)),
  user: types.frozen({}),
  app: types.model({
    baseURL: types.string,
  }),
  kinds: types.array(Kind),
  dishes: types.array(Dish),
}).views(self => ({

})).actions(self => ({
  resetDateDish(dateDishes) {
    const map = {};
    dateDishes.forEach(v => {
      if (!map[v.date]) {
        map[v.date] = []
      }
      map[v.date].push(v)
    })
    self.monthDateDish.replace(map)
  },
  setDateDish(date, data) {
    self.monthDateDish.set(date, cast(data));
  },
  getDateList(date) {
    return toJS(self.monthDateDish.get(date)) || [];
  }
}));

const store = Store.create({
  app: { baseURL: 'http://localhost:3006' },
  DateDish: {},
  kinds: [],
  dishes: [],
});

export default store;