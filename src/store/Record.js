import { types } from 'mobx-state-tree'
import { Dish } from './Dish'

export const Record = types.model('Record', {
  id: types.string,
  dish_id: types.string,
  date: types.string,
  can_repeated: types.number,
  sn: types.number,
  type: types.string,
  dish: types.maybe(Dish),
  repeated: types.optional(types.boolean, false)
})
