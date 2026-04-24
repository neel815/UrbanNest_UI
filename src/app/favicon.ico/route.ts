import { NextResponse } from 'next/server';

export function GET() {
  // Prevent noisy 404s in the console for browsers that request /favicon.ico by default.
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

