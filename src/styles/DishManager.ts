import { css } from '@linaria/core';
import { styled } from '@linaria/react';

export const Main = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  height: 100%;
  padding: 10px 0;

  @media(max-width: 1024px) {
    grid-template-columns: 1fr;
  }
  @media(max-width: 768px) {
    gap: 12px;
    display: block;
    overflow: auto;
  }
`
export const DishForm = styled.div`
  background: white;
  padding: 10px;
  gap: 10px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  & h3 {
    font-size: 16px;
    color: #333;
    font-weight: 600;
  }

  @media(max-width: 768px) {
    padding: 12px;
    height: auto;
  }
`
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`
export const input_select = css`
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  flex: 1;
  font-family: inherit;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: #667eea;
    background-color: #f8f9ff;
  }
  &::placeholder {
    color: #999;
  }
`
export const DishesList = styled.div`
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 0px 5px rgba(0, 0, 0, 0.1);
  height: 100%;
  overflow: auto;

  & h3 {
    font-size: 16px;
    color: #333;
    margin-bottom: 16px;
    font-weight: 600;
  }

  @media(max-width: 768px) {
    padding: 12px;
    height: auto;
  }
`
export const DishesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;

  @media(max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`
export const DishCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: white;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }
`
export const DishInfo = styled.div`
  flex: 1;

  & h4 {
    font-size: 14px;
    color: #333;
    margin-bottom: 4px;
    font-weight: 600;
  }
`
export const Operation = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`
export const CategoryLabel = styled.p`
  font-size: 12px;
  color: #999;
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 2px;
  width: fit-content;
`
