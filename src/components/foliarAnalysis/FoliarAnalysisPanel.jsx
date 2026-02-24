import "./FoliarAnalysisPanel.css";
import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import foliarAnalysisRows from "../../data/foliarAnalysisRows.json";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const FoliarAnalysisPanel = ({ eventLabel, selectedCuartel }) => {
  const normalizedSelectedCuartel = String(selectedCuartel ?? "").trim().toUpperCase();
  const hasAnalysisData = (row) =>
    [
      row.nitrogenoTotal,
      row.fosforo,
      row.potasio,
      row.calcio,
      row.magnesio,
      row.hierro,
      row.manganeso,
      row.zinc,
      row.cobre,
      row.boro,
      row.sodio,
      row.cloro,
      row.clorofila,
    ].some((value) => value !== null && value !== undefined && String(value).trim() !== "");

  const rowData = useMemo(
    () =>
      foliarAnalysisRows.map((row) => ({
        temp: row["Temp."],
        cuartel: row.Cuartel,
        nitrogenoTotal: row["Nitrógeno total"],
        fosforo: row.fosforo,
        potasio: row.potasio,
        calcio: row.calcio,
        magnesio: row.magnesio,
        hierro: row.hierro,
        manganeso: row.manganeso,
        zinc: row.ziinc,
        cobre: row.cobre,
        boro: row.boro,
        sodio: row.sodio,
        cloro: row.cloro,
        clorofila: row.clorofila,
      }))
        .filter((row) =>
          normalizedSelectedCuartel
            ? String(row.cuartel ?? "").trim().toUpperCase() === normalizedSelectedCuartel
            : false
        )
        .filter(hasAnalysisData),
    [normalizedSelectedCuartel]
  );

  const columnDefs = useMemo(
    () => [
      { field: "temp", headerName: "Temp.", filter: "agNumberColumnFilter", pinned: "left" },
      { field: "cuartel", headerName: "Cuartel", filter: true, pinned: "left" },
      { field: "nitrogenoTotal", headerName: "Nitrógeno total (%)", filter: "agNumberColumnFilter" },
      { field: "fosforo", headerName: "Fósforo (%)", filter: "agNumberColumnFilter" },
      { field: "potasio", headerName: "Potasio (%)", filter: "agNumberColumnFilter" },
      { field: "calcio", headerName: "Calcio (%)", filter: "agNumberColumnFilter" },
      { field: "magnesio", headerName: "Magnesio (%)", filter: "agNumberColumnFilter" },
      { field: "hierro", headerName: "Hierro (ppm)", filter: "agNumberColumnFilter" },
      { field: "manganeso", headerName: "Manganeso (ppm)", filter: "agNumberColumnFilter" },
      { field: "zinc", headerName: "Zinc (ppm)", filter: "agNumberColumnFilter" },
      { field: "cobre", headerName: "Cobre (ppm)", filter: "agNumberColumnFilter" },
      { field: "boro", headerName: "Boro (ppm)", filter: "agNumberColumnFilter" },
      { field: "sodio", headerName: "Sodio (ppm)", filter: "agNumberColumnFilter" },
      { field: "cloro", headerName: "Cloro (%)", filter: "agNumberColumnFilter" },
      { field: "clorofila", headerName: "Clorofila (Spad)", filter: "agNumberColumnFilter" },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      flex: 1,
      minWidth: 130,
    }),
    []
  );

  return (
    <div className="foliar-analysis-panel">
      <span className="foliar-analysis-panel__title">
        {eventLabel}
        {selectedCuartel ? ` - ${selectedCuartel}` : " - selecciona una geometria"}
      </span>
      <div className="foliar-analysis-panel__grid ag-theme-alpine">
        <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} />
      </div>
    </div>
  );
};

export default FoliarAnalysisPanel;
