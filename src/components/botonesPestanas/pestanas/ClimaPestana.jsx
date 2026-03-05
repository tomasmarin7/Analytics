import PestanaBoton from "./PestanaBoton";

const ClimaPestana = ({ isActive, onClick, setButtonRef }) => {
  return (
    <PestanaBoton
      id="clima"
      label="Clima"
      variant="clima"
      isActive={isActive}
      onClick={onClick}
      setButtonRef={setButtonRef}
    />
  );
};

export default ClimaPestana;
