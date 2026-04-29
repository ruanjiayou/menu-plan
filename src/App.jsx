import React, { useState, useEffect } from 'react'
import './App.css'
import MealPlanner from './components/MealPlanner'
import DishManager from './components/DishManager'
import { CalendarDays, ChefHat } from 'lucide-react'
import { getAccessToken, getDishes, getKinds, getProfile } from './apis'
import { formatDate } from 'date-fns'
import UserStatus from './components/UserStatus'
import { useSnapshot } from 'valtio'
import global from './global/index'

const App = () => {
  const store = useSnapshot(global)
  const [activeTab, setActiveTab] = useState('planner')

  useEffect(() => {
    const search = new URLSearchParams(window.location.search)
    const refresh_token = search.get('refresh_token')
    if (refresh_token) {
      store.user.refresh_token = (refresh_token)
      window.location.replace(window.location.origin + window.location.pathname)
    }
    const init = async () => {
      if (store.user.refresh_token && !store.user.access_token) {
        try {
          const tokens = await getAccessToken(store.user.refresh_token)
          if (tokens) {
            global.user.access_token = (tokens.access_token)
            global.user.refresh_token = (tokens.refresh_token)
          }
        } catch (e) {

        }
      }
      if (store.user.access_token && !store.user.profile) {
        const result = await getProfile();
        global.user.profile = (result.item)
      }

      const kinds = await getKinds()
      global.kinds = kinds;
      const dishes = await getDishes({ with: 'kind' })
      global.dishes = dishes
    };
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
              <CalendarDays size={18} /> {formatDate(store.currentDateTime, 'yyyy-MM')}
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
}
export default App;