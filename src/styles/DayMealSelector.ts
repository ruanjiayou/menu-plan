import { styled } from '@linaria/react';

export const MealSection = styled.div`
  border-bottom: 1px solid #e0e0e0;
  &:last-of-type {
    border-bottom: none;
  }
`
export const MealTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
`
export const SelectedDishesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  min-height: 32px;
`
export const DishTagWrapper = styled.div`
  background-color: #e8ebff;
  color: #667eea;
  border: 1px solid #667eea;
  padding: 6px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  
  &.repreated {
    background-color: #fff3cd;
    color: #856404;
    border-color: #ffc107;
  }
`
export const DishTagContent = styled.span`
  display: flex;
  align-items: center;
`
export const DishTagActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 4px;
`
export const RepeatCheck = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  transition: opacity 0.3s ease;
  border-radius: 3px;

  &:hover {
    opacity: 0.7;
    background-color: rgba(0, 0, 0, 0.1);
  }

  &.enable {
    color: inherit;
  }

  &.disabled {
    color: #999;
  }
`
export const EmptyText = styled.p`
  color: #999;
  font-size: 12px;
  padding: 8px 0;
  text-align: center;
  line-height: 1.33;
`

export const CategoryTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #ccc;
`
export const DishesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
`
export const DishCell = styled.button`
  position: relative;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  transition: all 0.3s ease;
  text-align: center;
  word-break: break-word;

  &:hover {
    border-color: #667eea;
    background-color: #f8f9ff;
  }

  &.selected {
    background-color: #e8ebff;
    border-color: #667eea;
    color: #667eea;
  }

  &.repreated {
    background-color: #fff3cd;
    border-color: #ffc107;
  }
`

export const DishCellChecked = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
`
export const DishCellRepeated = styled.span`
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`