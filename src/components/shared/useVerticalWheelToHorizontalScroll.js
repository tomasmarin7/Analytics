import { useEffect } from "react";

export const useVerticalWheelToHorizontalScroll = (scrollRef) => {
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;

    const handleWheel = (event) => {
      const hasHorizontalOverflow = element.scrollWidth > element.clientWidth;
      if (!hasHorizontalOverflow) return;

      const horizontalDelta = Math.abs(event.deltaX);
      const verticalDelta = Math.abs(event.deltaY);
      if (verticalDelta <= horizontalDelta) return;

      event.preventDefault();
      element.scrollLeft += event.deltaY;
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, [scrollRef]);
};
