import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MapPin, PenLine, Send, Users } from "lucide-react";
import { useState } from "react";
import { ClientsTab } from "./components/ClientsTab";
import { ComposeTab } from "./components/ComposeTab";
import { MessageAllTab } from "./components/MessageAllTab";

const queryClient = new QueryClient();

function AppContent() {
  const [tab, setTab] = useState("clients");
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container max-w-5xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between gap-4">
            {/* AMKY Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/assets/uploads/IMG-20260312-WA0001-2.jpg"
                alt="AMKY & Co Logo"
                className="h-14 w-auto rounded object-contain bg-white p-1"
              />
              <div>
                <h1 className="font-display text-2xl font-bold tracking-wide text-primary-foreground">
                  AMKY <span className="text-accent">&amp;</span> Co
                </h1>
                <p className="text-xs tracking-[0.18em] uppercase text-primary-foreground/60 font-body">
                  Chartered Accountants
                </p>
              </div>
            </div>
            {/* CA India Logo */}
            <img
              src="/assets/uploads/IMG-20260312-WA0000-1.jpg"
              alt="CA India Logo"
              className="h-14 w-auto rounded object-contain bg-white p-1 hidden sm:block"
            />
          </div>
          {/* Gold rule */}
          <div className="mt-4 h-px bg-gradient-to-r from-accent/80 via-accent/30 to-transparent" />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="container max-w-5xl mx-auto px-4 py-7">
          <Tabs value={tab} onValueChange={setTab} className="space-y-6">
            <TabsList className="bg-card border border-border shadow-xs h-11 p-1 w-full sm:w-auto">
              <TabsTrigger
                value="clients"
                data-ocid="clients.tab"
                className="gap-2 text-sm flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Users className="h-4 w-4" />
                <span>Clients</span>
              </TabsTrigger>
              <TabsTrigger
                value="broadcast"
                data-ocid="broadcast.tab"
                className="gap-2 text-sm flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Send className="h-4 w-4" />
                <span>Message All</span>
              </TabsTrigger>
              <TabsTrigger
                value="compose"
                data-ocid="compose.tab"
                className="gap-2 text-sm flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <PenLine className="h-4 w-4" />
                <span>Compose</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clients" className="mt-0">
              <ClientsTab />
            </TabsContent>
            <TabsContent value="broadcast" className="mt-0">
              <MessageAllTab />
            </TabsContent>
            <TabsContent value="compose" className="mt-0">
              <ComposeTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 mt-10">
        <div className="container max-w-5xl mx-auto px-4 text-center space-y-2">
          <div className="flex items-start justify-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-accent" />
            <span>
              Shop No 28, Palika Bazar, Ghodbunder Rd, opp. to Om Sai Diesel,
              near Sai Baba Mandir, Kapurbawdi, Thane West, Thane, Maharashtra
              400607
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {year} AMKY &amp; Co · Chartered Accountants ·{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-accent transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <Toaster richColors position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
