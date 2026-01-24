import { useMemo } from "react";
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
  const whatsappHref = useMemo(() => buildWhatsAppUrl(DEFAULT_MESSAGE), []);
  const smsHref = useMemo(() => buildSmsUrl(DEFAULT_MESSAGE), []);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-2xl ring-2 ring-background/60 transition hover:scale-105 hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/80"
            aria-label="Contact PR Soccer School"
          >
            <span className="text-xl" aria-hidden="true">
              •
            </span>
            <span>Message</span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="top" sideOffset={10}>
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
