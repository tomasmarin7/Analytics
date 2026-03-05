import PestanaBoton from "./PestanaBoton";

const RaleoPestana = ({ isActive, onClick, setButtonRef }) => {
  return (
    <PestanaBoton
      id="raleo"
      label="Raleo"
      variant="raleo"
      isActive={isActive}
      onClick={onClick}
      setButtonRef={setButtonRef}
    />
  );
};

export default RaleoPestana;
