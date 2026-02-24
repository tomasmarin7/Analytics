import "./UsuarioHeader.css";
import iconoUsuario from "../../assets/images/icono-usuario.png";

const UsuarioHeader = () => {
  return (
    <div className="usuario-header" aria-label="Usuario actual">
      <img className="usuario-header__icon" src={iconoUsuario} alt="Usuario" />
      <span className="usuario-header__name">Demo</span>
    </div>
  );
};

export default UsuarioHeader;
