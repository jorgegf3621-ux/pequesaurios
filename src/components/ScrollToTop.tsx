import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // PUSH = usuario hizo clic en un enlace → ir al inicio
    // POP  = botón atrás/adelante del navegador → restaurar posición anterior
    if (navType === "PUSH" || navType === "REPLACE") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname, navType]);

  return null;
};

export default ScrollToTop;
