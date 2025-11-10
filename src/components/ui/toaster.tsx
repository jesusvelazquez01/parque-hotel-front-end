
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="bottom-right"
      toastOptions={{
        className: "bg-hotel-slate border border-hotel-gold/20 text-white",
        descriptionClassName: "text-white/80",
      }}
    />
  );
}
