
import { Poppins } from "next/font/google";
import  Montserrat from "next/font/local";
import "./globals.css";
import Rainbow from "@/utils/rainbow";
import { MiniKitContextProvider } from "@/utils/MiniKitProvider";

import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  return {
    title: "Late Night on Base",
    description:
      "Daily Base ecosystem updates in 60 seconds, plus replays of top streams featuring the builders shaping the future. Hosted by Bill the Bull.",
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
        button: {
          title: `Tune in!`,
          action: {
            type: "launch_frame",
            name: "Late Night on Base",
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE,
            splashBackgroundColor:
              "#3b0404",
          },
        },
      }),
    },
  };
}


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"]
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` ${poppins.className} antialiased`}
      >
        <MiniKitContextProvider>{children}</MiniKitContextProvider>
      </body>
    </html>
  );
}
