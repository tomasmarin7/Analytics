import PestanaBoton from "./PestanaBoton";

const RdtoPrePodaPestana = ({ isActive, onClick, setButtonRef }) => {
  return (
    <PestanaBoton
      id="rdto-pre-poda"
      label="Rdto. Pre Poda"
      variant="rdto-pre-poda"
      isActive={isActive}
      onClick={onClick}
      setButtonRef={setButtonRef}
    />
  );
};

export default RdtoPrePodaPestana;
