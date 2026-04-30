import React, { useState, useEffect, useRef } from 'react'
import { format, isSameMonth, formatDate, } from 'date-fns'
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

const Grids42 = ({ month, today, days, setSelectedDate }) => {
  const today_date = formatDate(today, 'yyyy-MM-dd');
  return <CalendarDays>
    {days.map(day => {
      const date = format(day, 'yyyy-MM-dd')
      const dayMeals = global.dateRecordsMap.get(date) || [];
      const lunch = dayMeals.filter(v => v.type === 'lunch')
      const dinner = dayMeals.filter(v => v.type === 'dinner')
      const sameMonth = isSameMonth(day, month)

      return (
        <CalendarDay
          key={date}
          className={`${!sameMonth ? outside : ''} ${date === today_date ? 'today' : ''}`}
          onClick={() => {
            if (sameMonth) {
              if (!global.dateRecordsMap.get(date)) {
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

const MealPlanner = () => {
  const globalState = useSnapshot(global)
  const [selectedDate, setSelectedDate] = useState(null)
  const swiperRef = useRef(null);
  const date = formatDate(globalState.currentDateTime, 'yyyy-MM-dd')

  useEffect(() => {
    loadDateRecords()
    // 获取本月所需数据(本月+前后7天)
    getRecordsByDate(date).then(list => {
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
          <SwiperSlide id='1'>
            <Grids42 days={globalState.prev42day} month={globalState.prevMonth} today={globalState.currentDateTime} setSelectedDate={setSelectedDate} />
          </SwiperSlide>
          <SwiperSlide id='2'>
            <Grids42 days={globalState.this42day} month={globalState.currentDateTime} today={globalState.currentDateTime} setSelectedDate={setSelectedDate} />
          </SwiperSlide>
          <SwiperSlide id='3'>
            <Grids42 days={globalState.next42day} month={globalState.nextMonth} today={globalState.currentDateTime} setSelectedDate={setSelectedDate} />
          </SwiperSlide>
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