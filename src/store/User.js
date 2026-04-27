import { types } from 'mobx-state-tree'
import storage from '../utils/storage';

export const User = types.model('User', {
  profile: types.maybe(types.model('Profile', {
    _id: types.string,
    avatar: types.string,
    nickname: types.string,
  })),
  access_token: types.optional(types.string, ''),
  refresh_token: types.optional(types.string, ''),
})
  .views(self => ({
    get isLogin() {
      return this.profile != null;
    },

  }))
  .actions(self => ({
    setAccessToken(token) {
      self.access_token = token;
      storage.setValue('access_token', token)
    },
    setRefreshToken(token) {
      self.refresh_token = token;
      storage.setValue('refresh_token', token)
    },
  }))
  .actions(self => ({
    setProfile(info) {
      self.profile = info
      storage.setValue('profile', JSON.stringify(info))
    },
    logout() {
      console.log('logout')
      self.profile = undefined;
      self.access_token = '';
      self.refresh_token = '';
      storage.removeKey('profile')
      storage.removeKey('access_token')
      storage.removeKey('refresh_token')
    }
  }));
