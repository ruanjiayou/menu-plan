import React, { useState, useEffect, useRef } from 'react'
import { format, isSameMonth, formatDate, } from 'date-fns'
import { getRecordsByDate, } from '../apis'
import DayMealSelector from './DayMealSelector'
import '../styles/MealPlanner.css'

import { getDateRepeatedList } from '../utils'
import { useSnapshot } from 'valtio'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import global from '../global'

const OneDish = ({ item }) => {
  return (
    <span
      key={item.id}
      className={`dish-tag ${item.repeated ? 'repeated' : ''}`}
    >
      {item.dish.title}
    </span>
  )
}

const Grids42 = ({ days, setSelectedDate }) => {
  const store = useSnapshot(global);
  const [todayDate] = useState(formatDate(new Date(), 'yyyy-MM-dd'))
  return <div className="calendar-days">
    {days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayMeals = global.dateRecordsMap.get(dateStr) || [];
      const lunch = dayMeals.filter(v => v.type === 'lunch')
      const dinner = dayMeals.filter(v => v.type === 'dinner')
      const sameMonth = isSameMonth(day, store.currentDateTime)
      return (
        <div
          key={dateStr}
          className={`calendar-day ${!sameMonth ? 'outside' : ''} ${dateStr === todayDate ? 'today' : ''}`}
          onClick={() => {
            if (sameMonth) {
              const date = formatDate(day, 'yyyy-MM-dd');
              if (!global.dateRecordsMap.get(date)) {
                global.setDateRecords(date, [])
              }
              setSelectedDate(date)
            }
          }}
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
  </div>
}

const MealPlanner = () => {
  const store = useSnapshot(global)
  const [selectedDate, setSelectedDate] = useState(null)
  const swiperRef = useRef(null);

  useEffect(() => {
    loadDateRecords()
    const date = formatDate(store.currentDateTime, 'yyyy-MM-dd')
    // 获取本月所需数据(本月+前后7天)
    getRecordsByDate(date).then(list => {
      global.setRecordsMap(list)
    })
  }, [store.currentDateTime])

  const loadDateRecords = async () => {
    global.loadLocalRecords(store.currentDateTime)
    // 计算本月部分数据的重复菜品
    // store.calc_repeat(store.currentDateTime)
  }

  const onChange = () => {
    global.setRecordsMap(store.dateRecordsMap)
  }
  return (
    <div className="meal-planner">
      <div className="calendar-grid">
        <div className="weekdays">
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <Swiper
          initialSlide={1} // 默认显示第二个
          modules={[]}
          ref={ref => swiperRef.current = ref}
          style={{ width: '100%' }}
          spaceBetween={50}
          slidesPerView={1}
          onSlideChangeTransitionEnd={(evt) => {
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
            <Grids42 days={store.prev42day} setSelectedDate={setSelectedDate} />
          </SwiperSlide>
          <SwiperSlide id='2'>
            <Grids42 days={store.this42day} setSelectedDate={setSelectedDate} />
          </SwiperSlide>
          <SwiperSlide id='3'>
            <Grids42 days={store.next42day} setSelectedDate={setSelectedDate} />
          </SwiperSlide>
        </Swiper>
      </div>
      {selectedDate && (
        <DayMealSelector
          date={selectedDate}
          onChange={onChange}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
export default MealPlanner