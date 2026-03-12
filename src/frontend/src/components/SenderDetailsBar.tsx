import { Input } from "@/components/ui/input";
import { Mail, Phone } from "lucide-react";

interface SenderDetailsBarProps {
  email: string;
  phone: string;
  onEmailChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
}

export function SenderDetailsBar({
  email,
  phone,
  onEmailChange,
  onPhoneChange,
}: SenderDetailsBarProps) {
  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest shrink-0">
        Sender Details
      </span>
      <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            data-ocid="sender.email_input"
            placeholder="Your email (e.g. amkyandco@gmail.com)"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="pl-8 h-8 text-sm bg-background"
          />
        </div>
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            data-ocid="sender.phone_input"
            placeholder="Your WhatsApp number (+91 XXXXXXXXXX)"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="pl-8 h-8 text-sm bg-background"
          />
        </div>
      </div>
    </div>
  );
}
