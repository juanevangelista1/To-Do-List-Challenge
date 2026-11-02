import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/trpc/client";

export const metadata: Metadata = {
  title: "Lista de Tarefas",
  description: "Gerenciador simples de tarefas com Next.js e tRPC",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
