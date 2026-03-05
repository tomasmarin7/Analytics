import PestanaBoton from "./PestanaBoton";

const FertilizacionPestana = ({ isActive, onClick, setButtonRef }) => {
  return (
    <PestanaBoton
      id="fertilizacion"
      label="Fertilización"
      variant="fertilizacion"
      isActive={isActive}
      onClick={onClick}
      setButtonRef={setButtonRef}
    />
  );
};

export default FertilizacionPestana;
