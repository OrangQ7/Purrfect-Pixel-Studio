export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">
    <rect width="32" height="32" fill="#cfeafa"/>
    <path fill="#111111" d="M8 6h4v4h8V6h4v5h3v12h-3v3H8v-3H5V11h3z"/>
    <path fill="#fff8e8" d="M9 11h14v12H9z"/>
    <path fill="#f7b8c9" d="M9 7h2v3H9zm12 0h2v3h-2z"/>
  </svg>`;

  return new Response(svg, {
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Content-Type": "image/svg+xml",
    },
  });
}
