import { readdir, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const SUPPORTED_IMAGE_MIME_TYPES = new Set(Object.values(MIME_BY_EXTENSION));

function normalizeLocalPath(value: string) {
  return value.trim().replace(/^["']|["']$/g, "");
}

function normalizeClientFileName(value: string) {
  const normalized = normalizeLocalPath(value);
  const fileName = normalized.split(/[\\/]/).filter(Boolean).pop() ?? "";

  return fileName.trim();
}

function getMimeTypeForImagePath(imagePath: string) {
  const extension = path.extname(imagePath).toLowerCase();
  const mimeType = MIME_BY_EXTENSION[extension];

  if (!mimeType) {
    throw new Error("Only JPG, PNG, and WEBP images are supported.");
  }

  return mimeType;
}

function decodeImageDataUrl(value: string) {
  const match = value
    .trim()
    .match(/^data:(image\/(?:jpeg|png|webp));base64,([a-z0-9+/=\s]+)$/i);

  if (!match) {
    throw new Error("The selected image could not be read.");
  }

  const mimeType = match[1].toLowerCase();

  if (!SUPPORTED_IMAGE_MIME_TYPES.has(mimeType)) {
    throw new Error("Only JPG, PNG, and WEBP images are supported.");
  }

  const bytes = Buffer.from(match[2].replace(/\s/g, ""), "base64");

  if (!bytes.length) {
    throw new Error("The selected image is empty.");
  }

  return { bytes, mimeType };
}

function getImageSearchRoots() {
  const home = os.homedir();

  return Array.from(
    new Set([
      path.join(home, "Desktop"),
      path.join(home, "Downloads"),
      path.join(home, "Pictures"),
      path.join(home, "Documents"),
      path.join(home, "OneDrive", "Desktop"),
      path.join(home, "OneDrive", "Downloads"),
      path.join(home, "OneDrive", "Pictures"),
      path.join(home, "OneDrive", "Documents"),
      path.join(home, "OneDrive", "文档"),
      path.join(home, "OneDrive", "文档", "xwechat_files"),
    ]),
  );
}

async function isReadableFile(filePath: string) {
  try {
    const fileStat = await stat(filePath);
    return fileStat.isFile();
  } catch {
    return false;
  }
}

async function findFileByName(
  root: string,
  fileName: string,
  maxDepth: number,
  visited = { count: 0 },
): Promise<string | null> {
  if (visited.count > 20000 || maxDepth < 0) {
    return null;
  }

  let entries;

  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return null;
  }

  const files = entries.filter((entry) => entry.isFile());
  const folders = entries.filter((entry) => entry.isDirectory());

  for (const file of files) {
    visited.count += 1;

    if (file.name.toLowerCase() === fileName.toLowerCase()) {
      return path.join(root, file.name);
    }
  }

  for (const folder of folders) {
    visited.count += 1;

    const match = await findFileByName(
      path.join(root, folder.name),
      fileName,
      maxDepth - 1,
      visited,
    );

    if (match) {
      return match;
    }
  }

  return null;
}

async function resolveLocalImageName(clientValue: string) {
  const fileName = normalizeClientFileName(clientValue);

  if (!fileName) {
    throw new Error("Missing image file name.");
  }

  getMimeTypeForImagePath(fileName);

  const roots = getImageSearchRoots();

  for (const root of roots) {
    const directPath = path.join(root, fileName);

    if (await isReadableFile(directPath)) {
      return directPath;
    }
  }

  for (const root of roots) {
    const maxDepth = root.includes("xwechat_files") ? 8 : 3;
    const match = await findFileByName(root, fileName, maxDepth);

    if (match) {
      return match;
    }
  }

  throw new Error(`Unable to find "${fileName}" in common local image folders.`);
}

export type UploadedPhotoPayload = {
  bytes: Buffer;
  mimeType: string;
  sourceName: string;
};

export async function readUploadedPhotoPayload(
  formData: FormData,
): Promise<UploadedPhotoPayload | null> {
  const photo = formData.get("photo");

  if (photo instanceof File && photo.size > 0) {
    const bytes = Buffer.from(await photo.arrayBuffer());
    return {
      bytes,
      mimeType: photo.type || "image/png",
      sourceName: photo.name || "uploaded-cat",
    };
  }

  const photoDataUrl = formData.get("photoDataUrl");

  if (typeof photoDataUrl === "string" && photoDataUrl.trim()) {
    const photoFileName = formData.get("photoFileName");
    const { bytes, mimeType } = decodeImageDataUrl(photoDataUrl);
    const sourceName =
      typeof photoFileName === "string" && photoFileName.trim()
        ? normalizeClientFileName(photoFileName) || "uploaded-cat"
        : "uploaded-cat";

    return {
      bytes,
      mimeType,
      sourceName,
    };
  }

  const photoPath = formData.get("photoPath");

  if (typeof photoPath === "string" && photoPath.trim()) {
    const normalizedPath = normalizeLocalPath(photoPath);
    const mimeType = getMimeTypeForImagePath(normalizedPath);
    const bytes = await readFile(normalizedPath);

    return {
      bytes,
      mimeType,
      sourceName: path.basename(normalizedPath),
    };
  }

  const photoName = formData.get("photoName");

  if (typeof photoName !== "string" || !photoName.trim()) {
    return null;
  }

  const resolvedPath = await resolveLocalImageName(photoName);
  const mimeType = getMimeTypeForImagePath(resolvedPath);
  const bytes = await readFile(resolvedPath);

  return {
    bytes,
    mimeType,
    sourceName: path.basename(resolvedPath),
  };
}

export async function readLocalImagePath(localPath: string) {
  const normalizedPath = normalizeLocalPath(localPath);
  const mimeType = getMimeTypeForImagePath(normalizedPath);

  return {
    bytes: await readFile(normalizedPath),
    mimeType,
  };
}

export async function readLocalImageName(clientValue: string) {
  const resolvedPath = await resolveLocalImageName(clientValue);

  return readLocalImagePath(resolvedPath);
}
