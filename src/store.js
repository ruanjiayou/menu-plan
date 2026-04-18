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
  kind: types.maybe(Kind)
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
})).actions(self => ({
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
}));

export const store = Store.create({
  app: { baseURL: 'http://localhost:3006' },
  DateDish: {},
  kinds: [],
  dishes: [],
});
