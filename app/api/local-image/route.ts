import {
  readLocalImageName,
  readLocalImagePath,
} from "@/lib/serverUploadedPhoto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const imagePath = url.searchParams.get("path");
  const imageName = url.searchParams.get("name");

  if (!imagePath && !imageName) {
    return Response.json(
      { error: "Missing local image path or file name." },
      { status: 400 },
    );
  }

  try {
    const image = imagePath
      ? await readLocalImagePath(imagePath)
      : await readLocalImageName(imageName ?? "");

    return new Response(image.bytes, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Content-Type": image.mimeType,
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to read local image.",
      },
      { status: 400 },
    );
  }
}
