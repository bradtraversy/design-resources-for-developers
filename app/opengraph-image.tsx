import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Design Resources for Developers';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: 'linear-gradient(to right, #6366f1, #8b5cf6, #d946ef)',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ fontSize: 24, opacity: 0.9, marginBottom: 20 }}>
          Design Resources
        </div>
        <div style={{ fontSize: 48, fontWeight: 'bold' }}>For Developers</div>
        <div style={{ fontSize: 20, opacity: 0.8, marginTop: 20 }}>
          UI graphics, fonts, colors, icons & more
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
