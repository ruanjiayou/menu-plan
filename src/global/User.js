import { proxy } from 'valtio'

export const User = proxy({
  profile: null,
  access_token: '',
  refresh_token: '',
})