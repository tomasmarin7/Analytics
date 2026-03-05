import PestanaBoton from "./PestanaBoton";

const ProduccionPestana = ({ isActive, onClick, setButtonRef }) => {
  return (
    <PestanaBoton
      id="produccion"
      label="Producción"
      variant="produccion"
      isActive={isActive}
      onClick={onClick}
      setButtonRef={setButtonRef}
    />
  );
};

export default ProduccionPestana;
