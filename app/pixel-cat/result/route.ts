export function GET(request: Request) {
  return Response.redirect(new URL("/pixel-cat", request.url), 303);
}

export function POST(request: Request) {
  return Response.redirect(new URL("/pixel-cat", request.url), 303);
}
