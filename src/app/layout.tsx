import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cabecalho } from "@/components/cabecalho";
import { Providers } from "@/trpc/client";
import "./globals.css";

export const metadata: Metadata = {
  title: "To Do List App",
  description: "Simple task manager built with Next.js and tRPC",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Cabecalho />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
