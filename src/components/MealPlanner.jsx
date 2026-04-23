import React, { useState, useEffect, useRef } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, subDays, addDays, formatDate, } from 'date-fns'
import { getRecordsByDate, } from '../apis'
import DayMealSelector from './DayMealSelector'
import '../styles/MealPlanner.css'
import { useStore } from '../contexts/store'
import { getDateRepeatedList } from '../utils'
import { toJS } from 'mobx'
import { Observer, observer, useLocalObservable } from 'mobx-react'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.css';

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

const Grids42 = observer(({ days, setSelectedDay }) => {
  const store = useStore();
  const [todayDate] = useState(formatDate(new Date(), 'yyyy-MM-dd'))
  return <div className="calendar-days">
    {days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayMeals = store.dateRecordsMap.get(dateStr) || [];
      const lunch = dayMeals.filter(v => v.type === 'lunch')
      const dinner = dayMeals.filter(v => v.type === 'dinner')
      const sameMonth = isSameMonth(day, store.currentDateTime)
      return (
        <div
          key={dateStr}
          className={`calendar-day ${!sameMonth ? 'outside' : ''} ${dateStr === todayDate ? 'today' : ''}`}
          onClick={() => { sameMonth && setSelectedDay(day) }}
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
})

const MealPlanner = observer(() => {
  const store = useStore()
  const [selectedDay, setSelectedDay] = useState(null)
  const swiperRef = useRef(null);

  useEffect(() => {
    loadDateRecords()
    const date = formatDate(store.currentDateTime, 'yyyy-MM-dd')
    // 获取本月所需数据(本月+前后7天)
    getRecordsByDate(date).then(list => {
      store.setRecordsMap(list)
    })
  }, [store.currentDateTime])

  const loadDateRecords = async () => {
    store.loadLocalRecords(store.currentDateTime)
    // // 计算本月部分数据的重复菜品
    // const start = startOfMonth(store.currentDateTime).getDate()
    // const end = endOfMonth(store.currentDateTime).getDate()
    // for (let i = start; i <= end; i++) {
    //   const date = formatDate(addDays(store.currentDateTime, i), 'yyyy-MM-dd');
    //   const repeats = getDateRepeatedList(date, list)
    //   const dateDishes = store.getDateRecords(date);
    //   store.setDateRecords(date, dateDishes.map(v => {
    //     v.repeated = repeats.includes(v.dish_id);
    //     return v;
    //   }))
    // }
  }

  const onChange = () => {
    store.setRecordsMap(toJS(store.dateRecordsMap))
  }
  return <Observer>{() => (
    <div className="meal-planner">
      <div className="calendar-grid">
        <div className="weekdays">
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <Swiper
          initialSlide={1} // 默认显示第二个
          ref={ref => swiperRef.current = ref}
          style={{ width: '100%' }}
          spaceBetween={50}
          slidesPerView={1}
          onSlideChangeTransitionEnd={(evt) => {
            if (evt.activeIndex === 1) {
              return;
            }
            if (evt.swipeDirection === 'prev') {
              store.subMonth()
            } else {
              store.addMonth()
            }
            evt.slideTo(1, 0);
          }}
        >
          <SwiperSlide id='1'>
            <Grids42 days={store.prev42day} setSelectedDay={setSelectedDay} />
          </SwiperSlide>
          <SwiperSlide id='2'>
            <Grids42 days={store.this42day} setSelectedDay={setSelectedDay} />
          </SwiperSlide>
          <SwiperSlide id='3'>
            <Grids42 days={store.next42day} setSelectedDay={setSelectedDay} />
          </SwiperSlide>
        </Swiper>
      </div>
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