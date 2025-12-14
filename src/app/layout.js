import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./providers";
import CartSidebar from "./components/CartSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "La Bella Italia - Restaurant Italian Autentic",
  description: "Savurează preparate italiene autentice într-o atmosferă elegantă. Rezervări online disponibile.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <CartSidebar />
        </AuthProvider>
      </body>
    </html>
  );
}
