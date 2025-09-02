import { createClient } from "@farcaster/quick-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const client = createClient();
  const authorization = request.headers.get("Authorization");

  console.log("Authorization header:", authorization);  

  if (!authorization) {
    return NextResponse.json({ status: 401, statusText: "Unauthorized" });
  }
  var jwt: string = "";
  if (process.env.NEXT_PUBLIC_ENV === "DEV") {
    console.log("Development mode: using DEV_HEADER");
    jwt = process.env.DEV_HEADER as string;
  }
  else{
jwt = authorization?.split(" ")[1] as string;
  }
  

  console.log("JWT token:", jwt);

  const payload = await client.verifyJwt({
    token: jwt,
    domain: process.env.HOSTNAME as string,
  });

  console.log("JWT payload:", payload);

  const fidParam = payload.sub;
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
