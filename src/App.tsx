import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { DinoWalker } from "@/components/DinoDecor";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Servicios from "./pages/Servicios";
import Catalogo from "./pages/Catalogo";
import Cotizador from "./pages/Cotizador";
import Reservaciones from "./pages/Reservaciones";
import Contacto from "./pages/Contacto";
import Admin from "./pages/Admin";
import Accion from "./pages/Accion";
import BabyPlayZone from "./pages/BabyPlayZone";
import ActividadCreativa from "./pages/ActividadCreativa";
import Yesitos from "./pages/Yesitos";
import MobiliarioInfantil from "./pages/MobiliarioInfantil";
import Pintacaritas from "./pages/Pintacaritas";
import Gracias from "./pages/Gracias";
import NotFound from "./pages/NotFound";
import AvisoPrivacidad from "./pages/AvisoPrivacidad";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Página sin navbar/footer */}
          <Route path="/gracias" element={<Gracias />} />
          {/* Resto con layout completo */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main className="min-h-screen">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/servicios" element={<Servicios />} />
                  <Route path="/catalogo" element={<Catalogo />} />
                  <Route path="/cotizador" element={<Cotizador />} />
                  <Route path="/reservaciones" element={<Reservaciones />} />
                  <Route path="/contacto" element={<Contacto />} />
                  <Route path="/baby-play-zone" element={<BabyPlayZone />} />
                  <Route path="/actividad-creativa" element={<ActividadCreativa />} />
                  <Route path="/yesitos" element={<Yesitos />} />
                  <Route path="/mobiliario-infantil" element={<MobiliarioInfantil />} />
                  <Route path="/pintacaritas" element={<Pintacaritas />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/accion" element={<Accion />} />
                  <Route path="/aviso-privacidad" element={<AvisoPrivacidad />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <DinoWalker />
              <WhatsAppButton />
            </>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
