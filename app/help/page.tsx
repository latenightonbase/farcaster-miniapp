export default function HelpPage() {
  return (
    <main className="container  mx-auto px-4 pt-24 pb-20">

      <div className="max-w-3xl mx-auto p-6 rounded-lg ">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bill-pink mb-10"><span className='mr-2'>🧨</span> How the LNOB Sponsorship Auction Works</h1>

          <div className="text-white text-left">
            <p className="mb-4">Every week, we run a 48-hour live auction for one golden prize:</p>
            <p className="text-xl font-semibold text-bill-pink/80 mb-4">The Official LNOB Sponsorship Slot of the Week</p>
            
            <p className="mb-2 font-semibold">What you win:</p>
            <ul className="space-y-1 mb-4">
              <li><span className='mr-2'>🎤</span> Guest appearance on the LNOB show (10K+ impressions weekly)</li>
              <li><span className='mr-2'>📱</span> Sponsored shoutouts in every stream</li>
              <li><span className='mr-2'>🧠</span> BNKR blitz campaign for engagement</li>
              <li><span className='mr-2'>📢</span> Featured banner in-app + clickable link</li>
              <li><span className='mr-2'>🎞️</span> Zora clip to memorialize your moment</li>
              <li><span className='mr-2'>🔁</span> Exposure across Base + Farcaster</li>
              <li><span className='mr-2'>🔥</span> All powered by your LNOB token or USDC bid</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}