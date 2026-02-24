import { useState } from "react";
import HeaderNavCarousel from "./HeaderNavCarousel";
import SelectorCultivo from "./SelectorCultivo";
import UsuarioHeader from "./UsuarioHeader";
import "./Header.css";
import logoEmpresa from "../../assets/images/logo-empresa.png";

const Header = () => {
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="header">
      <div className="header__left">
        {!logoError ? (
          <img
            className="header__logo"
            src={logoEmpresa}
            alt="Logo de la empresa"
            onError={() => setLogoError(true)}
          />
        ) : (
          <span className="header__logo-fallback">Logo empresa</span>
        )}
      </div>
      <div className="header__center">
        <HeaderNavCarousel />
      </div>
      <div className="header__right">
        <SelectorCultivo />
        <span className="header__divider" aria-hidden="true" />
        <UsuarioHeader />
      </div>
    </header>
  );
};

export default Header;
