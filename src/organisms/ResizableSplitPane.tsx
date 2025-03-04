import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface ResizablePaneProps {
  initialLeftWidth?: number; // percentage
  minLeftWidth?: number; // percentage
  minRightWidth?: number; // percentage
  leftComponent: React.ReactNode;
  rightComponent: React.ReactNode;
}

// Resizable container styles
const Container = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const LeftPane = styled.div<{ width: number }>`
  width: ${props => props.width}%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const RightPane = styled.div<{ width: number }>`
  width: ${props => props.width}%;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const ResizeHandle = styled.div`
  width: 6px;
  height: 100%;
  cursor: col-resize;
  background-color: #2a2c35;
  position: absolute;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:hover {
    background-color: #3e3f46;
  }
  
  &:active {
    background-color: #3e3f46;
  }
  
  // Resize handle grip lines
  &::after {
    content: '';
    height: 30px;
    width: 2px;
    background-color: #555;
    border-radius: 1px;
  }
`;

const ResizableSplitPane: React.FC<ResizablePaneProps> = ({
  initialLeftWidth = 50,
  minLeftWidth = 20,
  minRightWidth = 20,
  leftComponent,
  rightComponent
}) => {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const handleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;
      
      // Calculate new left pane width as a percentage
      let newLeftWidth = (mouseX / containerWidth) * 100;
      
      // Apply constraints
      if (newLeftWidth < minLeftWidth) newLeftWidth = minLeftWidth;
      if (newLeftWidth > (100 - minRightWidth)) newLeftWidth = 100 - minRightWidth;
      
      setLeftWidth(newLeftWidth);
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [minLeftWidth, minRightWidth]);
  
  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };
  
  return (
    <Container ref={containerRef}>
      <LeftPane width={leftWidth}>
        {leftComponent}
      </LeftPane>
      
      <ResizeHandle
        ref={handleRef}
        onMouseDown={handleMouseDown}
        style={{ left: `${leftWidth}%` }}
      />
      
      <RightPane width={100 - leftWidth}>
        {rightComponent}
      </RightPane>
    </Container>
  );
};

export default ResizableSplitPane;