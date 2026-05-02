import { styled } from '@linaria/react';
import { css } from '@linaria/core';

export const Main = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px 0;
  overflow: hidden;
  position: relative;
`

export const CalendarGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  flex: 1;
  overflow: hidden;
  touch-action: 'none';
  position: relative;
`
export const Weekdays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
  line-height: 18px;
  padding-bottom: 10px;
`
export const Weekday = styled.div`
  text-align: center;
  font-weight: 600;
  color: #666;
  padding: 8px;
  font-size: 16px;
`
export const CalendarDays = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  flex: 1;
  overflow: auto;

  @media (max-width: 768px) {
    gap: 2px;
  }
`
export const CalendarDay = styled.div`
  /* aspect-ratio: 1; */
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  background: white;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: auto;

  @media (max-width: 768px) {
    gap: 2px;
    padding: 6px;
  }

  &::-webkit-scrollbar {
    display: none;
  }
  &:hover {
    border-color: #667eea;
    background-color: #f8f9ff;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }
  &.today {
    background-color: lightgoldenrodyellow;
  }
  &.other-month {
    opacity: 0.4;
    cursor: default;
  }
  &.other-month:hover {
    border-color: #e0e0e0;
    background-color: white;
    box-shadow: none;
  }
`
export const outside = css`
  opacity: 0.5;
`
export const DayNumber = styled.div`
  font-weight: 600;
  /* color: #333; */
  font-size: 16px;
  padding: 0 4px;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`
export const MealBlock = styled.div`
  display: flex;
  gap: 4px;
  align-items: flex-start;
  flex-wrap: wrap;
  align-content: flex-start;
  font-size: 14px;

  @media (max-width: 768px) {
    font-size: 12px;
    gap: 2px;
  }
`
export const MealLabel = styled.div`
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  min-width: 18px;
  text-align: center;
  flex-shrink: 0;

  &.lunch {
    background-color: #ff9800b0;
  }
  &.dinner {
    background-color: #2196f3b0;
  }
`
export const MealDishes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  flex: 1;
`
export const DishTag = styled.span`
  background-color: #ccc;
  color: #333;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 10px;
  }

  &.repreated {
    background-color: #ffc107;
    color: white;
    font-weight: 600;
  }
`
