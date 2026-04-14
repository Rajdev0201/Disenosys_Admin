import { DM_Sans } from "next/font/google";
import "./globals.css";


const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata = {
  title: "Disenosys Admin",
  description: "Disenosys Admin Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
