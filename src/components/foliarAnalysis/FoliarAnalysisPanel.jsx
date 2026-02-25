import foliarAnalysisRows from "../../data/foliarAnalysisRows.json";
import DataRecordsSection from "../dataRecordsSection/DataRecordsSection";
import FoliarAnalysisTableCard from "./FoliarAnalysisTableCard";
import { FOLIAR_SCORE_FIELDS, mapFoliarRow } from "./foliarAnalysisConfig";

const FoliarAnalysisPanel = ({ eventLabel, selectedCuartel }) => (
  <DataRecordsSection
    selectedCuartel={selectedCuartel}
    rawRows={foliarAnalysisRows}
    mapRow={mapFoliarRow}
    scoreFields={FOLIAR_SCORE_FIELDS}
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
