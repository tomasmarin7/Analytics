import { useEffect, useState } from "react";

export const useSyncedTableMetrics = ({ tablesScrollRef, rowCount }) => {
  const [syncedTableMetrics, setSyncedTableMetrics] = useState({
    headerHeightPx: null,
    rowHeightPx: null,
  });

  useEffect(() => {
    const scrollElement = tablesScrollRef.current;
    if (!scrollElement) return undefined;

    const updateMetrics = () => {
      const headerCell = scrollElement.querySelector(".foliar-analysis-table-card__table thead th");
      const bodyCell = scrollElement.querySelector(".foliar-analysis-table-card__table tbody td");
      if (!headerCell || !bodyCell) return;

      const nextHeaderHeight = Math.round(headerCell.getBoundingClientRect().height);
      const nextRowHeight = Math.round(bodyCell.getBoundingClientRect().height);

      setSyncedTableMetrics((current) => {
        if (current.headerHeightPx === nextHeaderHeight && current.rowHeightPx === nextRowHeight) return current;
        return { headerHeightPx: nextHeaderHeight, rowHeightPx: nextRowHeight };
      });
    };

    updateMetrics();
    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(scrollElement);
    window.addEventListener("resize", updateMetrics);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateMetrics);
    };
  }, [rowCount, tablesScrollRef]);

  return syncedTableMetrics;
};
