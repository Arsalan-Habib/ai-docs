import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/providers/NextAuthProvider";
import Header from "@/components/Header/Header";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/utils/theme";
import { Analytics } from "@vercel/analytics/react";
// or `v1X-appRouter` if you are using Next.js v1X

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Docs",
  description: "The AI Docs companion you always wanted",
};

export default function RootLayout({
  children,
  modal,
  signInModal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
  signInModal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <>
              <NextAuthProvider>{children}</NextAuthProvider>
              {modal}

              {signInModal}

              <div id="modal-root" />
            </>
          </ThemeProvider>
        </AppRouterCacheProvider>
        <Analytics />
      </body>
    </html>
  );
}
