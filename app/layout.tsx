import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Account Planner",
  description: "Opportunity qualification and competitive advantage planning",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
