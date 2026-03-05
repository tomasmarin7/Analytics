import PestanaBoton from "./PestanaBoton";

const PodaPestana = ({ isActive, onClick, setButtonRef }) => {
  return (
    <PestanaBoton
      id="poda"
      label="Poda"
      variant="poda"
      isActive={isActive}
      onClick={onClick}
      setButtonRef={setButtonRef}
    />
  );
};

export default PodaPestana;
