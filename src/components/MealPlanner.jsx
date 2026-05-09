import React, { useState, useEffect, useRef, memo } from 'react'
import { format, subDays, addDays, isSameMonth, formatDate, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, } from 'date-fns'
import { getRecordsByDate, } from '../apis'
import DayMealSelector from './DayMealSelector'

import { getDateRepeatedList } from '../utils'
import { useSnapshot } from 'valtio'
import { Swiper, SwiperSlide } from 'swiper/react';
import global from '../global'

import {
  Main,
  CalendarDays,
  CalendarDay,
  CalendarGrid,
  Weekdays,
  Weekday,
  outside,
  DayNumber,
  MealBlock,
  MealLabel,
  MealDishes,
  DishTag,
} from '../styles/MealPlanner'

const OneDish = ({ item }) => {
  return (
    <DishTag
      className={`dish-tag ${item.repeated ? 'repreated' : ''}`}
    >
      {item.dish.title}
    </DishTag>
  )
}

const Grids42 = ({ month, today, setSelectedDate }) => {
  const globalState = useSnapshot(global)
  const date = new Date(month);
  const monthStart = startOfMonth(date);
  const start_of42 = subDays(monthStart, (monthStart.getDay() === 0 ? 7 : monthStart.getDay()) - 1);
  const end_of42 = addDays(start_of42, 41);
  const days = eachDayOfInterval({ start: start_of42, end: end_of42 })
  return <CalendarDays>
    {days.map(day => {
      const date = format(day, 'yyyy-MM-dd')
      const dayMeals = globalState.dateRecordsMap.get(date) || [];
      const lunch = dayMeals.filter(v => v.type === 'lunch')
      const dinner = dayMeals.filter(v => v.type === 'dinner')
      const sameMonth = isSameMonth(day, month)

      return (
        <CalendarDay
          key={date}
          meals={dayMeals}
          className={`${!sameMonth ? outside : ''} ${date === today ? 'today' : ''}`}
          onClick={() => {
            if (sameMonth) {
              if (!globalState.dateRecordsMap.get(date)) {
                global.setDateRecords(date, [])
              }
              setSelectedDate(date)
            }
          }}
        >
          <DayNumber>{format(day, 'd')}</DayNumber>
          {/* 午餐区块 */}
          <MealBlock className="lunch-block">
            <MealLabel className='lunch'>午</MealLabel>
            <MealDishes>
              {lunch.map(v => (
                <OneDish item={v} key={v.id} />
              ))}
            </MealDishes>
          </MealBlock>
          {/* 晚餐区块 */}
          <MealBlock className="dinner-block">
            <MealLabel className='dinner'>晚</MealLabel>
            <MealDishes>
              {dinner.map(v => (
                <OneDish item={v} key={v.id} />
              ))}
            </MealDishes>
          </MealBlock>
        </CalendarDay>
      )
    })}
  </CalendarDays>
}

const CacheGrid = memo(({ month, today, setSelectedDate }) => {
  return <Grids42 month={month} today={today} setSelectedDate={setSelectedDate} />
}, (prev, next) => {
  return prev.month === next.month
})

const MealPlanner = () => {
  const globalState = useSnapshot(global)
  const [selectedDate, setSelectedDate] = useState(null)
  const swiperRef = useRef(null);
  useEffect(() => {
    loadDateRecords()
    // 获取本月所需数据(本月+前后7天)
    getRecordsByDate(formatDate(globalState.currentDateTime, 'yyyy-MM')).then(list => {
      global.setRecordsMap(list)
    })
  }, [globalState.currentDateTime])

  const loadDateRecords = async () => {
    global.loadLocalRecords(globalState.currentDateTime)
    // 计算本月部分数据的重复菜品
    // globalState.calc_repeat(globalState.currentDateTime)
  }

  const onChange = () => {
    global.setRecordsMap(globalState.dateRecordsMap)
  }
  return (
    <Main>
      <CalendarGrid>
        <Weekdays>
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
            <Weekday key={day}>{day}</Weekday>
          ))}
        </Weekdays>
        <Swiper
          // 阻止 Swiper 触发浏览器的默认滚动/手势行为
          touchMoveStopPropagation={true}
          // 阻止冒泡，防止嵌套 Swiper 时触发父级滑动
          nested={true}
          // 模拟手势时的边缘行为（类似于 CSS 的 overscroll-behavior）
          // 防止滑动到最后一张时带动页面弹性滚动
          edgeSwipeDetection={true}
          edgeSwipeThreshold={20}
          // 重要的触摸保护
          touchStartPreventDefault={false} // 允许某些点击行为，但滑动仍由 Swiper 接管

          initialSlide={1} // 默认显示第二个
          modules={[]}
          ref={ref => swiperRef.current = ref}
          style={{ width: '100%' }}
          spaceBetween={50}
          slidesPerView={1}
          onTransitionEnd={(evt) => {
            if (evt.activeIndex === 1) {
              return;
            }
            if (evt.swipeDirection === 'prev') {
              global.subMonth()
            } else {
              global.addMonth()
            }
            evt.slideTo(1, 0);
          }}
        >
          {globalState.months.map(month => (
            <SwiperSlide key={month} id={month}>
              <CacheGrid month={month} today={globalState.today} setSelectedDate={setSelectedDate} />
            </SwiperSlide>
          ))}
        </Swiper>
      </CalendarGrid>
      {selectedDate && (
        <DayMealSelector
          date={selectedDate}
          onChange={onChange}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </Main>
  )
}
export default MealPlanner