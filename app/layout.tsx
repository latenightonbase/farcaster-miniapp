import { Poppins } from "next/font/google";
import Montserrat from "next/font/local";
import "./globals.css";
import Rainbow from "@/utils/rainbow";
import { MiniKitContextProvider } from "@/utils/MiniKitProvider";
import NavigationWrapper from "@/components/UI/NavigationWrapper";
import "nprogress/nprogress.css";
import "@/styles/nprogress.css";

import { Metadata } from "next";
import Background from "@/components/UI/Background";

export async function generateMetadata(): Promise<Metadata> {
  const URL = "https://farcaster-miniapp-liart.vercel.app";
  return {
    title: "Late Night on Base",
    description:
      "Daily Base ecosystem updates in 60 seconds, plus replays of top streams featuring the builders shaping the future. Hosted by Bill the Bull.",
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: "https://farcaster-miniapp-liart.vercel.app/pfp.jpg",
        button: {
          title: `Tune in!`,
          action: {
            type: "launch_frame",
            name: "Late Night on Base",
            url: URL,
            splashImageUrl:
              "https://farcaster-miniapp-liart.vercel.app/pfp.jpg",
            splashBackgroundColor: "#3b0404",
          },
        },
      }),
    },
  };
}

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} antialiased relative min-h-screen desktop-with-sidebar overflow-hidden`}
      >
        <Background />
        <MiniKitContextProvider>
          <div className="absolute left-0 lg:flex justify-center w-screen h-screen overflow-hidden lg:-translate-x-32">
            <NavigationWrapper />
            <div className="overflow-y-auto h-full max-[700px]:w-screen w-[700px]">
              {children}
            </div>
          </div>
        </MiniKitContextProvider>
      </body>
    </html>
  );
}
