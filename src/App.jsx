import React, { useState, useEffect, useCallback } from 'react'
import './App.css'
import MealPlanner from './components/MealPlanner'
import DishManager from './components/DishManager'
import { ChefHat, Settings, UserRound } from 'lucide-react'
import { useStore } from './contexts/store'
import { getDishes, getKinds } from './apis'
import { formatDate } from 'date-fns'
import { observer } from 'mobx-react-lite'

const App = observer(() => {
  const store = useStore()
  const [activeTab, setActiveTab] = useState('planner')
  const init = useCallback(async () => {
    const kinds = await getKinds()
    store.setKinds(kinds)
    const dishes = await getDishes({ with: 'kind' })
    store.setDishes(dishes)
  });

  useEffect(() => {
    init()
  }, [])
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content align-aside">
          <div className="logo">
            <img src="/menu-plan/logo.png" style={{ width: 50 }} />
            <h1>吃什么</h1>
          </div>
          <div className='user'>
            {store.user.isLogin
              ? <div className='full-width'>
                <UserRound size={40} />
              </div>
              : <div style={{ padding: '3px 10px', cursor: 'pointer', color: 'white', backgroundColor: '#999' }}>登录</div>}
          </div>
        </div>
      </header>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'planner' ? 'active' : ''}`}
          onClick={() => setActiveTab('planner')}
          style={{ fontSize: 18 }}
        >
          {formatDate(store.currentDateTime, 'yyyy-MM')}
        </button>
        <button
          className={`tab-button ${activeTab === 'dishes' ? 'active' : ''}`}
          onClick={() => setActiveTab('dishes')}
        >
          <Settings size={18} style={{ marginRight: '4px' }} />
          菜品管理
        </button>
      </div>
      <main className="app-main">
        {activeTab === 'planner' && <MealPlanner />}
        {activeTab === 'dishes' && <DishManager />}
      </main>
    </div>
  )
})
export default App;