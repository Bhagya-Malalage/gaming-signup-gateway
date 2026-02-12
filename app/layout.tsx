import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/app/ConvexClientProvider";
import UserSync from "./UserSync";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yolo247 | Gaming Experience",
  description: "Create your account to start playing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.className} min-h-screen flex flex-col bg-black text-white`}
        >
          <ConvexClientProvider>
            <UserSync />

            <div className="flex-1 flex flex-col">{children}</div>

            {/* THE DEFINITIVE GLOBAL FOOTER */}
            <footer className="w-full bg-black py-8 px-6 border-t border-white/5 text-center mt-auto">
              <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
                <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-tight">
                  <span className="font-bold text-white border border-white/20 px-1 rounded-sm mr-2">
                    TERMS AND CONDITIONS:
                  </span>
                  Eligibility: Open to all users who have completed FTD.
                  Participation: Each user gets two free spins. Rewards:
                  Promocodes are to be availed during a redeposit. The Brand
                  reserves the right to modify or cancel without prior notice.
                </p>
                <p className="text-[9px] text-gray-700 uppercase tracking-[0.4em] font-black opacity-40">
                  OFFICIAL GAMING HUB © 2024
                </p>
              </div>
            </footer>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
