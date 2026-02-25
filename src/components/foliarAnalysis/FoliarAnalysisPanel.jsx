import foliarAnalysisRows from "../../data/foliarAnalysisRows.json";
import DataRecordsSection from "../dataRecordsSection/DataRecordsSection";
import FoliarAnalysisTableCard from "./FoliarAnalysisTableCard";
import { FOLIAR_SCORE_FIELDS, mapFoliarRow } from "./foliarAnalysisConfig";
import { FOLIAR_ANALYSIS_EVENT_ID } from "../../features/timelineEvents";
import "../../features/timelineEvents/budAnalysis/tab.css";
import "../../features/timelineEvents/prePruningCount/tab.css";

const FoliarAnalysisPanel = ({
  activeEvents = [],
  selectedCuartel,
  selectedYears,
  onSelectedYearsChange,
}) => {
  const tabItems = activeEvents.map((event) => ({ id: event.id, label: event.label }));
  const hasFoliarAnalysis = activeEvents.some((event) => event.id === FOLIAR_ANALYSIS_EVENT_ID);

  if (!hasFoliarAnalysis) {
    return (
      <div className="foliar-analysis-tabs-only">
        <div className="foliar-analysis-tabs-only__tabs">
          {tabItems.map((tab) => (
            <span
              key={tab.id}
              className={`foliar-analysis-table-card__tab foliar-analysis-table-card__tab--${tab.id}`}
            >
              {tab.label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DataRecordsSection
      selectedCuartel={selectedCuartel}
      rawRows={foliarAnalysisRows}
      mapRow={mapFoliarRow}
      scoreFields={FOLIAR_SCORE_FIELDS}
      selectedYears={selectedYears}
      onSelectedYearsChange={onSelectedYearsChange}
    >
      {({ rowData, selectedYearsCount }) => (
        <FoliarAnalysisTableCard
          tabItems={tabItems}
          rowData={rowData}
          selectedYearsCount={selectedYearsCount}
        />
      )}
    </DataRecordsSection>
  );
};

export default FoliarAnalysisPanel;
