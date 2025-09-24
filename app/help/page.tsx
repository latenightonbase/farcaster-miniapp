export default function HelpPage() {
  return (
    <main className="container  mx-auto px-4 py-10">

      <div className="max-w-3xl mx-auto rounded-lg max-lg:h-screen max-lg:flex items-center justify-center pt-6">
        <div className="mb-8">
          <h1 className="lg:text-3xl text-2xl font-bold text-bill-pink mb-4"> How the LNOB Sponsorship Auction Works:</h1>

          <div className="text-white text-left ">
            <p className="mb-4 lg:text-xl text-lg">Every week, we run a 48-hour live auction for one golden prize:</p>
            {/* <p className="text-xl font-semibold text-bill-pink/80 mb-4">The Official LNOB Sponsorship Slot of the Week</p> */}
            
            <div className="p-4 rounded-xl bg-white/10 text-md">
<p className="mb-2 font-semibold">What you win:</p>
            <ul className="space-y-1">
              <li className="flex"><span className='flex-shrink-0 mr-2'>🎤</span> <span>Guest appearance on the LNOB show (averages 1k-2.5k viewers every show)</span></li>
              <li className="flex"><span className='flex-shrink-0 mr-2'>📱</span> <span>Sponsored shoutouts in every stream - you are the official host for every show the following. Live banner and QR code played during the episode</span></li>
              <li className="flex"><span className='flex-shrink-0 mr-2'>🧠</span> <span>BNKR blitz campaign for engagement</span></li>
              <li className="flex"><span className='flex-shrink-0 mr-2'>📢</span> <span>Featured banner in-app + clickable link</span></li>
              <li className="flex"><span className='flex-shrink-0 mr-2'>🎞️</span> <span>Zora clip to memorialize your moment</span></li>
              <li className="flex"><span className='flex-shrink-0 mr-2'>🔁</span> <span>Exposure across Base + Farcaster + access to the LNOB community (50k+ holders)</span></li>
              <li className="flex"><span className='flex-shrink-0 mr-2'>🔥</span> <span>All powered by your LNOB token or USDC bid</span></li>
            </ul>
            </div>
            
          </div>
        </div>
      </div>
    </main>
  );
}