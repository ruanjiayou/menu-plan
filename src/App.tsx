import React, { useState, useEffect } from 'react'
import MealPlanner from './components/MealPlanner'
import DishManager from './components/DishManager'
import { CalendarDays, ChefHat } from 'lucide-react'
import { getDishes, getKinds, } from './apis'
import { formatDate } from 'date-fns'
import { useSnapshot } from 'valtio'
import global, { useLocalProxy } from './global'
import { AlignAside } from './styles/common'
import LogoSVG from './asserts/logo.svg?react';
import { Wrap, AppHeader, HeaderContent, AppMain, Logo, TabNavigation, TabButton } from './styles/App'
import UserInfo, { User } from 'user-info'

export default () => {
  const store = useSnapshot(global)
  const user = useSnapshot(User);
  const [activeTab, setActiveTab] = useState('planner')

  const [localState, localStore] = useLocalProxy({
    booted: false,
    loading: false,
  });

  const init = async () => {
    try {
      global.app.access_token = user.access_token;
      global.app.refresh_token = user.refresh_token;
      const kinds = await getKinds()
      global.kinds = kinds;
      const dishes = await getDishes({ with: 'kind' })
      global.dishes = dishes
    } catch (err) {

    }
  }
  useEffect(() => {
    if (!localState.booted && user.access_token) {
      localStore.booted = true
      init()
    }
  }, [user.access_token])
  useEffect(() => {
    const search = new URLSearchParams(window.location.search)
    const refresh_token = search.get('refresh_token')
    if (refresh_token) {
      User.setRefreshToken(refresh_token)
      window.location.replace(window.location.origin + window.location.pathname)
    }
  }, [])
  return (
    <Wrap>
      <AppHeader>
        <HeaderContent className={AlignAside}>
          <Logo>
            <LogoSVG style={{ width: 30, height: 30 }} />
            <h1>吃什么</h1>
          </Logo>

          <TabNavigation>
            <TabButton
              className={activeTab === 'planner' ? 'active' : ''}
              onClick={() => setActiveTab('planner')}
            >
              <CalendarDays size={18} /> {formatDate(store.currentDateTime, 'yyyy-MM')}
            </TabButton>
            <TabButton
              className={activeTab === 'dishes' ? 'active' : ''}
              onClick={() => setActiveTab('dishes')}
            >
              <ChefHat size={20} style={{ marginRight: '4px' }} />
              菜品
            </TabButton>
          </TabNavigation>

          <UserInfo onLogout={() => {
            global.app.access_token = '';
            global.dateRecordsMap.clear()
          }} />
        </HeaderContent>
      </AppHeader>

      <AppMain>
        {activeTab === 'planner' && <MealPlanner />}
        {activeTab === 'dishes' && <DishManager />}
      </AppMain>
    </Wrap>
  )
};