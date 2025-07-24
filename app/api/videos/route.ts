import { NextRequest, NextResponse } from 'next/server';
import { createS3VideoUploader } from '@/lib/s3-utils';

// GET: Retrieve all videos from S3
export async function GET() {
  try {
    const s3Uploader = createS3VideoUploader();
    const videos = await s3Uploader.listVideos();
    
    return NextResponse.json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch videos',
      },
      { status: 500 }
    );
  }
}

// POST: Upload video to S3
