import { types } from 'mobx-state-tree'

export const User = types.model('User', {
  profile: types.maybeNull(types.model('Profile', {
    id: types.string,
    name: types.string,
    avatar: types.string,
  })),
  access_token: types.optional(types.string, ''),
  refresh_token: types.optional(types.string, ''),
})
  .views(self => ({
    get isLogin() {
      return this.profile !== null;
    },

  }))
