import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { NotificationsProvider } from "../context/NotificationsContext";
import Eruda from "../components/dev/Eruda";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata = {
  // Needed so shared links get absolute Open Graph URLs. Set NEXT_PUBLIC_SITE_URL in production.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Dwellst | Long-term rentals in the Philippines",
  description: "Find rooms, bedspaces, boardinghouses, apartments and houses for long-term rent in the Philippines.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-ink antialiased">
        <Eruda />
        <AuthProvider>
          <ToastProvider>
            <NotificationsProvider>{children}</NotificationsProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}