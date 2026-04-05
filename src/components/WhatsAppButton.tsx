"use client";

export default function WhatsAppButton() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "905541790203";
  const message = encodeURIComponent(
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "Merhaba, VIP Transfer için bilgi almak istiyorum."
  );

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-white shadow-lg transition hover:bg-green-600"
      onClick={() => (window as any).gtag?.("event","whatsapp_click",{location:"button"})}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        className="h-6 w-6"
      >
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.12.55 4.19 1.6 6.01L0 24l6.17-1.62A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22a9.92 9.92 0 0 1-5.06-1.36l-.36-.21-3.66.96.98-3.56-.24-.37A9.92 9.92 0 0 1 2 12c0-5.52 4.48-10 10-10 2.67 0 5.18 1.04 7.07 2.93A9.92 9.92 0 0 1 22 12c0 5.52-4.48 10-10 10zm5.26-7.56c-.29-.15-1.72-.85-1.99-.95-.27-.1-.46-.15-.66.15-.2.3-.76.95-.93 1.15-.17.2-.34.22-.63.07-.29-.15-1.23-.45-2.34-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.66-1.59-.91-2.18-.24-.58-.48-.5-.66-.51-.17 0-.36-.01-.55-.01-.19 0-.5.07-.76.36-.26.29-1 1-1 2.44 0 1.44 1.03 2.84 1.18 3.03.15.19 2.02 3.09 4.88 4.34.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34z" />
      </svg>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
