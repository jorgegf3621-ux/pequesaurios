import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (hash) {
      // Espera a que React renderice la sección destino
      const timer = setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "instant" });
      }, 50);
      return () => clearTimeout(timer);
    }

    if (navType === "PUSH" || navType === "REPLACE") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    // POP (botón atrás) → el navegador restaura la posición anterior
  }, [pathname, hash, navType]);

  return null;
};

export default ScrollToTop;
