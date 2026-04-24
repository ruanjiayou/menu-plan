import { types } from 'mobx-state-tree'

export const App = types.model('App', {
  baseURL: types.optional(types.string, ''),
})
