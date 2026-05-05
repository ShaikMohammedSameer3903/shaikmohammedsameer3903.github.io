import { useState, useEffect, useCallback, useRef } from 'react';

// useGestures Hook - Touch gesture detection for mobile interactions
export function useGestures({ onSwipeLeft, onSwipeRight, onPullDown } = {}) {
  const [isPulling, setIsPulling] = useState(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });

  const onTouchStart = useCallback((e) => {
    const touch = e.touches?.[0] || e;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    touchEnd.current = { x: touch.clientX, y: touch.clientY };
    setIsPulling(false);
  }, []);

  const onTouchMove = useCallback((e) => {
    const touch = e.touches?.[0] || e;
    touchEnd.current = { x: touch.clientX, y: touch.clientY };

    // Detect pull-down
    const dy = touch.clientY - touchStart.current.y;
    if (dy > 80 && touchStart.current.y < 100) {
      setIsPulling(true);
    } else {
      setIsPulling(false);
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    const dx = touchEnd.current.x - touchStart.current.x;
    const dy = touchEnd.current.y - touchStart.current.y;

    // Minimum swipe distance
    const minSwipe = 50;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
      if (dx > 0 && onSwipeRight) onSwipeRight();
      if (dx < 0 && onSwipeLeft) onSwipeLeft();
    }

    if (dy > 80 && touchStart.current.y < 100 && onPullDown) {
      onPullDown();
    }

    setIsPulling(false);
  }, [onSwipeLeft, onSwipeRight, onPullDown]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isPulling
  };
}

export default useGestures;
