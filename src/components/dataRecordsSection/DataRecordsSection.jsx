import "./DataRecordsSection.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDataRecordsSectionData } from "./useDataRecordsSectionData";
import YearSelector from "./YearSelector/YearSelector";
import YearIndexColumn from "./YearIndexColumn/YearIndexColumn";

const DataRecordsSection = ({
  selectedCuartel,
  rawRows,
  mapRow,
  scoreFields,
  keepAllRowsPerYear,
  groupDisplayYears,
  sortRows,
  yearHeaderLabel,
  layoutVariant,
  selectedYears: controlledSelectedYears,
  onSelectedYearsChange,
  children,
}) => {
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false);
  const yearPickerRef = useRef(null);
  const tablesScrollRef = useRef(null);
  const pillScrollbarRef = useRef(null);
  const dragStateRef = useRef(null);
  const [horizontalScrollState, setHorizontalScrollState] = useState({
    isScrollable: false,
    thumbWidthPx: 0,
    thumbOffsetPx: 0,
  });

  const {
    normalizedSelectedCuartel,
    availableYears,
    selectedYears,
    rowData,
    displayYears,
    toggleYear,
  } = useDataRecordsSectionData({
    selectedCuartel,
    rawRows,
    mapRow,
    scoreFields,
    keepAllRowsPerYear,
    groupDisplayYears,
    sortRows,
    selectedYears: controlledSelectedYears,
    onSelectedYearsChange,
  });

  useEffect(() => {
    setIsYearMenuOpen(false);
  }, [normalizedSelectedCuartel]);

  useEffect(() => {
    if (!isYearMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (yearPickerRef.current?.contains(event.target)) return;
      setIsYearMenuOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isYearMenuOpen]);

  useEffect(() => {
    const element = tablesScrollRef.current;
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
  }, []);

  useEffect(() => {
    const scrollElement = tablesScrollRef.current;
    const scrollbarElement = pillScrollbarRef.current;
    if (!scrollElement || !scrollbarElement) return undefined;

    const updateHorizontalScrollState = () => {
      const viewportWidth = scrollElement.clientWidth;
      const contentWidth = scrollElement.scrollWidth;
      const trackWidth = scrollbarElement.clientWidth;

      if (contentWidth <= viewportWidth || trackWidth <= 0) {
        setHorizontalScrollState({
          isScrollable: false,
          thumbWidthPx: 0,
          thumbOffsetPx: 0,
        });
        return;
      }

      const thumbWidthPx = Math.max(58, (viewportWidth / contentWidth) * trackWidth);
      const maxThumbOffsetPx = Math.max(0, trackWidth - thumbWidthPx);
      const maxScrollLeft = contentWidth - viewportWidth;
      const thumbOffsetPx =
        maxScrollLeft <= 0 ? 0 : (scrollElement.scrollLeft / maxScrollLeft) * maxThumbOffsetPx;

      setHorizontalScrollState({
        isScrollable: true,
        thumbWidthPx,
        thumbOffsetPx,
      });
    };

    updateHorizontalScrollState();

    const resizeObserver = new ResizeObserver(updateHorizontalScrollState);
    resizeObserver.observe(scrollElement);
    resizeObserver.observe(scrollbarElement);

    scrollElement.addEventListener("scroll", updateHorizontalScrollState, { passive: true });
    window.addEventListener("resize", updateHorizontalScrollState);

    return () => {
      resizeObserver.disconnect();
      scrollElement.removeEventListener("scroll", updateHorizontalScrollState);
      window.removeEventListener("resize", updateHorizontalScrollState);
    };
  }, []);

  const handleThumbPointerDown = (event) => {
    const scrollElement = tablesScrollRef.current;
    const scrollbarElement = pillScrollbarRef.current;
    if (!scrollElement || !scrollbarElement || !horizontalScrollState.isScrollable) return;

    const maxScrollLeft = scrollElement.scrollWidth - scrollElement.clientWidth;
    const maxThumbOffsetPx = scrollbarElement.clientWidth - horizontalScrollState.thumbWidthPx;
    if (maxScrollLeft <= 0 || maxThumbOffsetPx <= 0) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startScrollLeft: scrollElement.scrollLeft,
      maxScrollLeft,
      maxThumbOffsetPx,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handleThumbPointerMove = (event) => {
    const scrollElement = tablesScrollRef.current;
    const dragState = dragStateRef.current;
    if (!scrollElement || !dragState || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startClientX;
    const scrollDelta = (deltaX / dragState.maxThumbOffsetPx) * dragState.maxScrollLeft;
    scrollElement.scrollLeft = dragState.startScrollLeft + scrollDelta;
  };

  const handleThumbPointerUp = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
  };

  const handlePillScrollbarPointerDown = (event) => {
    if (event.target !== event.currentTarget) return;

    const scrollElement = tablesScrollRef.current;
    const scrollbarElement = pillScrollbarRef.current;
    if (!scrollElement || !scrollbarElement || !horizontalScrollState.isScrollable) return;

    const trackRect = scrollbarElement.getBoundingClientRect();
    const clickOffset = event.clientX - trackRect.left;
    const desiredThumbCenter = clickOffset - horizontalScrollState.thumbWidthPx / 2;
    const maxThumbOffsetPx = Math.max(0, trackRect.width - horizontalScrollState.thumbWidthPx);
    const clampedThumbOffsetPx = Math.min(maxThumbOffsetPx, Math.max(0, desiredThumbCenter));
    const maxScrollLeft = scrollElement.scrollWidth - scrollElement.clientWidth;
    const nextScrollLeft = maxThumbOffsetPx <= 0 ? 0 : (clampedThumbOffsetPx / maxThumbOffsetPx) * maxScrollLeft;
    scrollElement.scrollLeft = nextScrollLeft;
  };

  const thumbStyle = useMemo(
    () => ({
      width: `${horizontalScrollState.thumbWidthPx}px`,
      transform: `translateX(${horizontalScrollState.thumbOffsetPx}px)`,
    }),
    [horizontalScrollState.thumbOffsetPx, horizontalScrollState.thumbWidthPx]
  );

  return (
    <div className={`data-records-section${layoutVariant ? ` data-records-section--${layoutVariant}` : ""}`}>
      <aside
        className={`data-records-section__context${
          isYearMenuOpen ? " data-records-section__context--menu-open" : ""
        }`}
      >
        <YearSelector
          yearPickerRef={yearPickerRef}
          availableYears={availableYears}
          selectedYears={selectedYears}
          isYearMenuOpen={isYearMenuOpen}
          onToggleMenu={() => setIsYearMenuOpen((current) => !current)}
          onToggleYear={toggleYear}
        />
        <YearIndexColumn years={displayYears} yearHeaderLabel={yearHeaderLabel} />
      </aside>

      <div className="data-records-section__tables-area">
        <div ref={tablesScrollRef} className="data-records-section__tables-scroll">
          <div className="data-records-section__tables-track">
            {children({ rowData, selectedYearsCount: selectedYears.length })}
          </div>
        </div>
        <div
          ref={pillScrollbarRef}
          className={`data-records-section__pill-scrollbar${
            horizontalScrollState.isScrollable ? " data-records-section__pill-scrollbar--active" : ""
          }`}
          onPointerDown={handlePillScrollbarPointerDown}
          aria-hidden="true"
        >
          <div
            className="data-records-section__pill-scrollbar-thumb"
            style={thumbStyle}
            onPointerDown={handleThumbPointerDown}
            onPointerMove={handleThumbPointerMove}
            onPointerUp={handleThumbPointerUp}
            onPointerCancel={handleThumbPointerUp}
          />
        </div>
      </div>
    </div>
  );
};

export default DataRecordsSection;
