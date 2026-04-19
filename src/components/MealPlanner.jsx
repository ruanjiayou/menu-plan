import React, { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, subDays, addDays, formatDate, } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getStorageKey, getDateDishes, saveMealData, getDishesList, getDishRepeatCheckEnabled } from '../api'
import DayMealSelector from './DayMealSelector'
import '../styles/MealPlanner.css'
import { useStore } from '../contexts/store'
import { getDateRepeatedList } from '../utils'
import { toJS } from 'mobx'
import { Observer, observer, useLocalObservable } from 'mobx-react'

function OneDish({ item }) {
  return <Observer>{() => (
    <span
      key={item.id}
      className={`dish-tag ${item.repeated ? 'repeated' : ''}`}
    >
      {item.dish.title}
    </span>
  )}</Observer>
}

const MealPlanner = observer(() => {
  const store = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const local = useLocalObservable(() => ({
    MonthDateDishes: new Map(),
    get daysInMonth() {
      const monthStart = startOfMonth(this.currentDate)
      const monthEnd = endOfMonth(this.currentDate)
      return eachDayOfInterval({ start: monthStart, end: monthEnd })
    },
    get prev_days() {
      const start = startOfMonth(this.currentDate)
      const count = start.getDay() - 1
      const offset = count < 0 ? 7 + count : count;
      const results = [];
      for (let i = 1; i <= offset; i++) {
        results.push(formatDate(subDays(start, i), 'dd'))
      }
      return results.reverse();
    },
    get next_days() {
      const start = startOfMonth(this.currentDate)
      const end = endOfMonth(this.currentDate);
      const count = start.getDay() - 1
      const real_prev = count < 0 ? 7 + count : count;
      const offset = 42 - real_prev - end.getDate()
      const results = [];
      for (let i = 1; i <= offset; i++) {
        results.push(format(addDays(end, i), 'd'))
      }
      return results
    },
    get todayDate() {
      return formatDate(this.today, 'yyyy-MM-dd')
    },
    today: new Date(),
    currentDate: currentDate,
    setCurrentDate(d) {
      this.currentDate = d;
      setCurrentDate(d)
    }
  }))

  useEffect(() => {
    store.resetDateDish([])
    loadDateRecords()
  }, [currentDate])

  const loadDateRecords = async () => {
    const date = formatDate(local.currentDate, 'yyyy-MM-dd')
    // 获取本月所需数据(本月+前后7天)
    const list = await getDateDishes(date)
    store.resetDateDish(list)
    // 计算本月部分数据的重复菜品
    const start = startOfMonth(local.currentDate).getDate()
    const end = endOfMonth(local.currentDate).getDate()
    for (let i = start; i <= end; i++) {
      const date = formatDate(addDays(local.currentDate, i), 'yyyy-MM-dd');
      const repeats = getDateRepeatedList(date, list)
      const dateDishes = store.getDateList(date);
      store.setDateDish(date, dateDishes.map(v => {
        v.repeated = repeats.includes(v.dish_id);
        return v;
      }))
    }
    // 当前组件的数据，用于UI更新
    local.MonthDateDishes = toJS(store.monthDateDish)
  }

  const onChange = () => {
    local.MonthDateDishes = toJS(store.monthDateDish)
  }
  const handlePrevMonth = () => {
    local.setCurrentDate(subMonths(local.currentDate, 1))
  }

  const handleNextMonth = () => {
    local.setCurrentDate(addMonths(local.currentDate, 1))
  }
  return <Observer>{() => (
    <div className="meal-planner">
      <div className="planner-header">
        <button onClick={handlePrevMonth} className="nav-button">
          <ChevronLeft size={20} />
        </button>
        <h2>{format(local.currentDate, 'yyyy年 M月')}</h2>
        <button onClick={handleNextMonth} className="nav-button">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="calendar-grid">
        <div className="weekdays">
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {local.prev_days.map((v, idx) => (
            <div key={idx} className='calendar-day outside'>
              <div className='day-number'>{v}</div>
              {/* 午餐区块 */}
              <div className="meal-block lunch-block">
                <div className="meal-label">午</div>
                <div className="meal-dishes"></div>
              </div>
              {/* 晚餐区块 */}
              <div className="meal-block dinner-block">
                <div className="meal-label">晚</div>
                <div className="meal-dishes"></div>
              </div>
            </div>
          ))}
          {local.daysInMonth.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayMeals = local.MonthDateDishes.get(dateStr) || [];
            const lunch = dayMeals.filter(v => v.type === 'lunch')
            const dinner = dayMeals.filter(v => v.type === 'dinner')
            return (
              <div
                key={dateStr}
                className={`calendar-day ${!isSameMonth(day, local.currentDate) ? 'other-month' : ''} ${dateStr === local.todayDate ? 'today' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                <div className="day-number">{format(day, 'd')}</div>
                {/* 午餐区块 */}
                <div className="meal-block lunch-block">
                  <div className="meal-label">午</div>
                  <div className="meal-dishes">
                    {lunch.map(v => (
                      <OneDish item={v} key={v.id} />
                    ))}
                  </div>
                </div>
                {/* 晚餐区块 */}
                <div className="meal-block dinner-block">
                  <div className="meal-label">晚</div>
                  <div className="meal-dishes">
                    {dinner.map(v => (
                      <OneDish item={v} key={v.id} />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
          {local.next_days.map((v, idx) => (
            <div key={idx} className='calendar-day outside'>
              <div className='day-number'>{v}</div>
              {/* 午餐区块 */}
              <div className="meal-block lunch-block">
                <div className="meal-label">午</div>
                <div className="meal-dishes"></div>
              </div>
              {/* 晚餐区块 */}
              <div className="meal-block dinner-block">
                <div className="meal-label">晚</div>
                <div className="meal-dishes"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TODO: 改为根据date查store */}
      {selectedDay && (
        <DayMealSelector
          date={formatDate(selectedDay, 'yyyy-MM-dd')}
          onChange={onChange}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )}</Observer >
})
export default MealPlanner