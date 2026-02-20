import { google } from "googleapis";
import { Readable } from "stream";
import { readFile } from "fs/promises";

type DriveFile = {
  id: string;
  name: string;
  webViewLink?: string | null;
  mimeType?: string | null;
  modifiedTime?: string | null;
  size?: string | null;
};

async function getDriveAuth() {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  if (keyPath) {
    const raw = await readFile(keyPath, "utf-8");
    const parsed = JSON.parse(raw) as {
      client_email?: string;
      private_key?: string;
    };
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error("Invalid service account JSON.");
    }
    return new google.auth.JWT({
      email: parsed.client_email,
      key: parsed.private_key,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "";
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "").replace(
    /\\n/g,
    "\n"
  );

  if (!clientEmail || !privateKey) {
    throw new Error("Google Drive credentials are missing.");
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

async function getDriveClient() {
  const auth = await getDriveAuth();
  return google.drive({ version: "v3", auth });
}

export async function uploadToDrive(payload: {
  filename: string;
  mimeType: string;
  buffer: Buffer;
}) {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID ?? "";
  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID is missing.");
  }

  const drive = await getDriveClient();
  const response = await drive.files.create({
    requestBody: {
      name: payload.filename,
      parents: [folderId],
    },
    media: {
      mimeType: payload.mimeType,
      body: Readable.from(payload.buffer),
    },
    fields: "id, name, webViewLink",
  });

  return response.data as DriveFile;
}

export async function listDriveFiles() {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID ?? "";
  if (!folderId) {
    return [];
  }

  const drive = await getDriveClient();
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id, name, webViewLink, mimeType, modifiedTime, size)",
    orderBy: "modifiedTime desc",
  });

  return (response.data.files ?? []) as DriveFile[];
}
