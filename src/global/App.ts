import { proxy } from 'valtio'

export const App = proxy({
  baseURL: '',
  access_token: '',
  refresh_token: '',
})