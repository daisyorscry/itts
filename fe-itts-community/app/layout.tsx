// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { cookies } from "next/headers";
import Providers from "./provider";
import Navbar from "@/components/navigation/Navbar";
import { Toaster } from "sonner";

type Mode = "light" | "dark" | "system";

export const metadata = {
  title: "ITTS Community",
  description:
    "Komunitas Networking, DevSecOps, Programming — Institut Teknologi Tangerang Selatan",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieTheme =
    (cookieStore.get("theme")?.value as Mode | undefined) ?? "system";

  const htmlProps: Record<string, any> = {
    lang: "id",
    suppressHydrationWarning: true,
  };
  if (cookieTheme === "light" || cookieTheme === "dark") {
    htmlProps["data-theme"] = cookieTheme;
  }

  return (
    <html {...htmlProps}>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <Providers initialMode={cookieTheme}>
          <Navbar />
          {children}
          <Toaster position='bottom-right' closeButton />
        </Providers>
      </body>
    </html>
  );
}
