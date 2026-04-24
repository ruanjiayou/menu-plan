import { types } from 'mobx-state-tree'

export const Kind = types.model('Kind', {
  id: types.string,
  title: types.string,
  sn: types.number,
})
