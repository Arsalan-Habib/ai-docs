import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/providers/NextAuthProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { Analytics } from "@vercel/analytics/react";
// or `v1X-appRouter` if you are using Next.js v1X

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});
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
      <body className={roboto.className}>
        <AppRouterCacheProvider>
          <>
            <NextAuthProvider>{children}</NextAuthProvider>
            {modal}

            {signInModal}

            <div id="modal-root" />
          </>
        </AppRouterCacheProvider>
        <Analytics />
      </body>
    </html>
  );
}
