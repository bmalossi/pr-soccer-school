import { MessageCircle, Send } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PHONE_E164 = "+14089089805";
const DEFAULT_MESSAGE = "Hi, I would like to know more about PR Soccer School programs.";

function getIsIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function buildWhatsAppUrl(message: string) {
  const phoneDigits = PHONE_E164.replace(/\D/g, "");
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

function buildSmsUrl(message: string) {
  // iOS uses sms:+number&body=... while most others accept sms:+number?body=...
  const joiner = getIsIOS() ? "&" : "?";
  return `sms:${PHONE_E164}${joiner}body=${encodeURIComponent(message)}`;
}

export function FloatingContactButton() {
  // Keep these as plain constants to avoid any hook-related edge cases.
  const whatsappHref = buildWhatsAppUrl(DEFAULT_MESSAGE);
  const smsHref = buildSmsUrl(DEFAULT_MESSAGE);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="group inline-flex items-center gap-2 rounded-full bg-accent/95 px-4 py-3 text-sm font-semibold tracking-tight text-accent-foreground shadow-2xl ring-1 ring-border/70 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/80"
            aria-label="Contact PR Soccer School"
          >
            <span className="text-xl leading-none opacity-90 transition-opacity group-hover:opacity-100" aria-hidden="true">
              •
            </span>
            <span>Message Now</span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="top" sideOffset={10} className="z-[60]">
          <DropdownMenuItem asChild>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer"
              aria-label="Send a message on WhatsApp"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={smsHref} className="cursor-pointer" aria-label="Send an SMS message">
              <Send className="mr-2 h-4 w-4" />
              SMS
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
