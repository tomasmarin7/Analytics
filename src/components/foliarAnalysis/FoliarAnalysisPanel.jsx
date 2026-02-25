import foliarAnalysisRows from "../../data/foliarAnalysisRows.json";
import DataRecordsSection from "../dataRecordsSection/DataRecordsSection";
import FoliarAnalysisTableCard from "./FoliarAnalysisTableCard";
import { FOLIAR_SCORE_FIELDS, mapFoliarRow } from "./foliarAnalysisConfig";

const FoliarAnalysisPanel = ({
  eventLabel,
  selectedCuartel,
  selectedYears,
  onSelectedYearsChange,
}) => (
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
        eventLabel={eventLabel}
        rowData={rowData}
        selectedYearsCount={selectedYearsCount}
      />
    )}
  </DataRecordsSection>
);

export default FoliarAnalysisPanel;
