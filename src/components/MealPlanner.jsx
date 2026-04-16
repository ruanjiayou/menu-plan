import React, { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, subDays } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getStorageKey, getMealData, saveMealData, getDishesData, getRepeatCheckEnabled } from '../utils/storage'
import DayMealSelector from './DayMealSelector'
import '../styles/MealPlanner.css'

const MealPlanner = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [meals, setMeals] = useState({})
  const [dishes, setDishes] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    loadMealsData()
    loadDishes()
  }, [currentDate])

  const loadMealsData = () => {
    const data = getMealData(currentDate)
    setMeals(data)
  }

  const loadDishes = () => {
    const dishesData = getDishesData()
    setDishes(dishesData)
  }

  const handleMealSelect = (date, mealData) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const newMeals = { ...meals }
    
    if (!newMeals[dateStr]) {
      newMeals[dateStr] = {}
    }
    
    newMeals[dateStr] = mealData
    setMeals(newMeals)
    saveMealData(currentDate, newMeals)
  }

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  // 检查菜品是否在最近7天重复（考虑重复判断开关）
  const isDishRepeatedInWeek = (date, dishName) => {
    for (let i = 1; i <= 7; i++) {
      const checkDate = subDays(date, i)
      const dateStr = format(checkDate, 'yyyy-MM-dd')
      const dayMeals = meals[dateStr] || {}
      
      // 检查午餐
      if (getRepeatCheckEnabled(dateStr, 'lunch')) {
        const lunch = dayMeals.lunch || []
        if (lunch.includes(dishName)) {
          return true
        }
      }
      
      // 检查晚餐
      if (getRepeatCheckEnabled(dateStr, 'dinner')) {
        const dinner = dayMeals.dinner || []
        if (dinner.includes(dishName)) {
          return true
        }
      }
    }
    return false
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  return (
    <div className="meal-planner">
      <div className="planner-header">
        <button onClick={handlePrevMonth} className="nav-button">
          <ChevronLeft size={20} />
        </button>
        <h2>{format(currentDate, 'yyyy年 M月')}</h2>
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
          {daysInMonth.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayMeals = meals[dateStr] || {}
            const lunch = dayMeals.lunch || []
            const dinner = dayMeals.dinner || []

            return (
              <div 
                key={day.toISOString()}
                className={`calendar-day ${!isSameMonth(day, currentDate) ? 'other-month' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                <div className="day-number">{format(day, 'd')}</div>
                
                {/* 午餐区块 */}
                <div className="meal-block lunch-block">
                  <div className="meal-label">午</div>
                  <div className="meal-dishes">
                    {lunch.map(dish => (
                      <span 
                        key={dish}
                        className={`dish-tag ${isDishRepeatedInWeek(day, dish) ? 'repeated' : ''}`}
                      >
                        {dish}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 晚餐区块 */}
                <div className="meal-block dinner-block">
                  <div className="meal-label">晚</div>
                  <div className="meal-dishes">
                    {dinner.map(dish => (
                      <span 
                        key={dish}
                        className={`dish-tag ${isDishRepeatedInWeek(day, dish) ? 'repeated' : ''}`}
                      >
                        {dish}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedDay && (
        <DayMealSelector
          date={selectedDay}
          meals={meals[format(selectedDay, 'yyyy-MM-dd')] || {}}
          dishes={dishes}
          isDishRepeatedInWeek={(dishName) => isDishRepeatedInWeek(selectedDay, dishName)}
          onMealSelect={(mealData) => handleMealSelect(selectedDay, mealData)}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}

export default MealPlanner