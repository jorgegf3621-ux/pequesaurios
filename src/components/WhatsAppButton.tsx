import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const phone = "528180540369";
  const message = encodeURIComponent("¡Hola! Me gustaría cotizar los servicios de Pequesaurios 🦕");

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[hsl(142_35%_78%)] text-[hsl(142_35%_22%)] px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all font-body font-bold"
    >
      <MessageCircle size={22} />
      <span className="hidden sm:inline">Cotizar por WhatsApp</span>
    </a>
  );
};

export default WhatsAppButton;
