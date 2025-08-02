import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { connectToDB } from '@/utils/db';
import SponsorFields from '@/utils/schemas/sponsorFields';

export async function POST(req: Request) {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  console.log("Initialized S3 client with region:", process.env.AWS_REGION);

  const formData = await req.formData();
  const file = formData.get('image');

  console.log('Received file:', file);

  if (!file || !(file instanceof Blob)) {
    console.error("Invalid file received:", file);
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = 'videos/banner';

  console.log("Uploading file to S3 with key:", key);

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: "image/*",
      Expires: new Date(Date.now() + 60 * 1000), // 1 minute expiration
    });

    await s3Client.send(command);

    const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    console.log("File uploaded successfully. Image URL:", imageUrl);

    // Connect to database and create sponsorFields object
    await connectToDB();
    
    const sponsorField = new SponsorFields({
      image: imageUrl,
    });

    await sponsorField.save();
    console.log('SponsorFields object created successfully:', sponsorField);

    return NextResponse.json({ imageUrl, sponsorFieldId: sponsorField._id });
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
