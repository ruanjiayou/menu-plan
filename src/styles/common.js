import { css } from '@linaria/core';
import { styled } from '@linaria/react';

export const AlignAside = css`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`
export const FullWidth = css`
  display: flex;
  flex-direction: row;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`

export const Mask = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 16px;
`
export const Modal = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.2);
`
export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;

  & h3 {
    font-size: 18px;
    color: #333;
    margin: 0;  
  }
`
export const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
`
export const ModalFooter = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px 15px;
  border-top: 1px solid #e0e0e0;
  background-color: #f8f8f8;
  gap: 10px;
`

export const Button = styled.div`
  flex: 1;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &.add {
    padding: 12px;
    color: white;
    cursor: pointer;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  &.delete {
    padding: 2px 3px;
    background: none;
    color: #999;
    cursor: pointer;
    &:hover {
      color: #ff5252;
    }
  }

  &.close {
    background: #ccc;
    color: white;
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`