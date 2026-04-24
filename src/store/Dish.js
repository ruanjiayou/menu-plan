import { types } from 'mobx-state-tree'
import { Kind } from './Kind'

export const Dish = types.model('Dish', {
  id: types.string,
  title: types.string,
  kind_id: types.string,
  sn: types.number,
  kind: types.maybe(Kind)
})
