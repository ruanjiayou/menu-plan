import React, { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, subDays, addDays } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getStorageKey, getMealData, saveMealData, getDishesData, getDishRepeatCheckEnabled } from '../utils/storage'
import DayMealSelector from './DayMealSelector'
import '../styles/MealPlanner.css'

const MealPlanner = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [meals, setMeals] = useState({})
  const [dishes, setDishes] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [repeatStatus, setRepeatStatus] = useState({}) // 存储每个日期的重复状态

  useEffect(() => {
    loadMealsData()
    loadDishes()
  }, [currentDate])

  const loadMealsData = () => {
    const data = getMealData(currentDate)
    setMeals(data)
    updateRepeatStatus(data)
  }

  const loadDishes = () => {
    const dishesData = getDishesData()
    setDishes(dishesData)
  }

  // 计算重复状态 - 检查前后7天（共15天）的范围
  const updateRepeatStatus = (mealsData) => {
    const status = {}
    const allDates = Object.keys(mealsData)

    allDates.forEach(dateStr => {
      status[dateStr] = {
        lunch: {},
        dinner: {}
      }

      const dayMeals = mealsData[dateStr] || {}
      const lunchDishes = dayMeals.lunch || []
      const dinnerDishes = dayMeals.dinner || []
      const date = new Date(dateStr)

      // 检查午餐菜品 - 检查前后7天（共15天）
      lunchDishes.forEach(dishItem => {
        const dishId = dishItem.id
        const enabled = getDishRepeatCheckEnabled(dateStr, dishId)
        
        if (enabled) {
          let foundCount = 0
          // 前7天 + 当天 + 后7天 = 共15天
          for (let i = -7; i <= 7; i++) {
            const checkDate = addDays(date, i)
            const checkDateStr = format(checkDate, 'yyyy-MM-dd')
            const checkMeals = mealsData[checkDateStr] || {}
            const checkLunch = checkMeals.lunch || []
            const checkDinner = checkMeals.dinner || []

            if (checkLunch.some(d => d.id === dishId) || checkDinner.some(d => d.id === dishId)) {
              foundCount++
            }
          }
          // 如果在15天范围内出现超过1次，则标记为重复
          status[dateStr].lunch[dishId] = foundCount > 1
        } else {
          status[dateStr].lunch[dishId] = false
        }
      })

      // 检查晚餐菜品 - 检查前后7天（共15天）
      dinnerDishes.forEach(dishItem => {
        const dishId = dishItem.id
        const enabled = getDishRepeatCheckEnabled(dateStr, dishId)
        
        if (enabled) {
          let foundCount = 0
          // 前7天 + 当天 + 后7天 = 共15天
          for (let i = -7; i <= 7; i++) {
            const checkDate = addDays(date, i)
            const checkDateStr = format(checkDate, 'yyyy-MM-dd')
            const checkMeals = mealsData[checkDateStr] || {}
            const checkLunch = checkMeals.lunch || []
            const checkDinner = checkMeals.dinner || []

            if (checkLunch.some(d => d.id === dishId) || checkDinner.some(d => d.id === dishId)) {
              foundCount++
            }
          }
          // 如果在15天范围内出现超过1次，则标记为重复
          status[dateStr].dinner[dishId] = foundCount > 1
        } else {
          status[dateStr].dinner[dishId] = false
        }
      })
    })

    setRepeatStatus(status)
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
    updateRepeatStatus(newMeals)
  }

  // 处理子组件传来的重复状态变化
  const handleRepeatStatusChange = (newRepeatStatus) => {
    setRepeatStatus(prev => ({
      ...prev,
      ...newRepeatStatus
    }))
  }

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
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
            const dayRepeatStatus = repeatStatus[dateStr] || { lunch: {}, dinner: {} }

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
                        key={dish.id}
                        className={`dish-tag ${dayRepeatStatus.lunch[dish.id] ? 'repeated' : ''}`}
                      >
                        {dish.title}
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
                        key={dish.id}
                        className={`dish-tag ${dayRepeatStatus.dinner[dish.id] ? 'repeated' : ''}`}
                      >
                        {dish.title}
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
          repeatStatus={repeatStatus[format(selectedDay, 'yyyy-MM-dd')] || { lunch: {}, dinner: {} }}
          onMealSelect={(mealData) => handleMealSelect(selectedDay, mealData)}
          onRepeatStatusChange={handleRepeatStatusChange}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}

export default MealPlanner