import type { Metadata, Viewport } from "next";
import { Onest } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/lib/query/provider";
import { AuthProvider } from "@/features/auth";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const onest = Onest({ variable: "--font-onest", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "GigSyc — Powering Flexible Work", template: "%s · GigSyc" },
  description: "GigSyc connects Kigali businesses with verified professionals for short-term, event and project work. The talent you need, when you need it.",
  applicationName: "GigSyc",
};

export const viewport: Viewport = {
  themeColor: "#001b56",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${onest.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          <AuthProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </AuthProvider>
        </QueryProvider>
        <Toaster
          position="bottom-center"
          offset={24}
          mobileOffset={88}
          toastOptions={{
            classNames: {
              toast: "!rounded-lg !border-0 !bg-navy-900 !text-white !shadow-pop !font-sans",
              description: "!text-white/70",
              actionButton: "!bg-amber-500 !text-navy-900 !font-medium",
              cancelButton: "!bg-white/10 !text-white",
            },
          }}
        />
      </body>
    </html>
  );
}
