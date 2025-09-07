import { createClient } from "@farcaster/quick-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {

  const url = new URL(request.url);
  const fidParam = url.searchParams.get("fid");
  if (!fidParam) {
    return NextResponse.json(
      { error: "Missing fid parameter" },
      { status: 401 }
    );
  }
  const fid = Number(fidParam);

  console.log("Parsed fid:", fid);
  if (Number.isNaN(fid)) {
    return NextResponse.json(
      { error: "Invalid fid parameter" },
      { status: 401 }
    );
  }

  const res = await fetch(
				`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
				{
					headers: {
						"x-api-key": process.env.NEXT_PUBLIC_NEYNAR_API_KEY as string,
					},
				}
			);

      const jsonRes = await res.json();
			const neynarRes = jsonRes.users?.[0];


  
      return NextResponse.json({ user : {fid: fid, username: neynarRes?.display_name} })
    
}
