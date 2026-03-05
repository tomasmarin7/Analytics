import PestanaBoton from "./PestanaBoton";

const CosechaPestana = ({ isActive, onClick, setButtonRef }) => {
  return (
    <PestanaBoton
      id="cosecha"
      label="Cosecha"
      variant="cosecha"
      isActive={isActive}
      onClick={onClick}
      setButtonRef={setButtonRef}
    />
  );
};

export default CosechaPestana;
