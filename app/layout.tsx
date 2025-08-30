import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/auth-context";

export const metadata: Metadata = {
  title: "Gala With Me!",
  description: "Created by animodev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
