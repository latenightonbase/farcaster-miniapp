export default function Background({ selected }: { selected: string }) {
  return (
    <div className={`absolute inset-0 bg-gradient-to-b duration-500 transition-colors from-black ${selected == "youtube" ? "via-red-500/20 to-red-500/50" : selected == "twitch" ? "via-purple-500/20 to-purple-500/50" : ""} opacity-50 z-0`}></div>
  );
}