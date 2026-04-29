import React, { useState, useEffect, useCallback } from 'react'
import './App.css'
import MealPlanner from './components/MealPlanner'
import DishManager from './components/DishManager'
import { CalendarDays, ChefHat } from 'lucide-react'
import { useStore } from './contexts/store'
import { getAccessToken, getDishes, getKinds, getProfile } from './apis'
import { formatDate } from 'date-fns'
import { observer } from 'mobx-react-lite'
import UserStatus from './components/UserStatus'

const App = observer(() => {
  const store = useStore()
  const [activeTab, setActiveTab] = useState('planner')
  const init = useCallback(async () => {
    if (store.user.refresh_token && !store.user.access_token) {
      try {
        const tokens = await getAccessToken(store.user.refresh_token)
        if (tokens) {
          store.user.setAccessToken(tokens.access_token)
          store.user.setRefreshToken(tokens.refresh_token)
        }
      } catch (e) {

      }
    }
    if (store.user.access_token && !store.user.profile) {
      const result = await getProfile();
      store.user.setProfile(result.item)
    }

    const kinds = await getKinds()
    store.setKinds(kinds)
    const dishes = await getDishes({ with: 'kind' })
    store.setDishes(dishes)
  });

  useEffect(() => {
    const search = new URLSearchParams(window.location.search)
    const refresh_token = search.get('refresh_token')
    if (refresh_token) {
      store.user.setRefreshToken(refresh_token)
      window.location.replace(window.location.origin + window.location.pathname)
    }
    init()
  }, [])
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content align-aside">
          <div className="logo">
            <img src="/menu-plan/logo.png" style={{ width: 30 }} />
            <h1>吃什么</h1>
          </div>

          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'planner' ? 'active' : ''}`}
              onClick={() => setActiveTab('planner')}
              style={{ fontSize: 18 }}
            >
              <CalendarDays size={18}/> {formatDate(store.currentDateTime, 'yyyy-MM')}
            </button>
            <button
              className={`tab-button ${activeTab === 'dishes' ? 'active' : ''}`}
              onClick={() => setActiveTab('dishes')}
            >
              <ChefHat size={20} style={{ marginRight: '4px' }} />
              菜品管理
            </button>
          </div>

          <UserStatus />
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'planner' && <MealPlanner />}
        {activeTab === 'dishes' && <DishManager />}
      </main>
    </div>
  )
})
export default App;