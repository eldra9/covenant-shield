import crypto from 'crypto';
import path from 'path';
import { StoredAttachment, QuarantineStatus } from '../../../../../packages/shared/src/types/index.ts';

// Private in-memory / disk file vault outside public web root
interface FileVaultEntry extends StoredAttachment {
  buffer: Buffer;
  authorizedSessionTokens: Set<string>;
}

const fileVault = new Map<string, FileVaultEntry>();

export class FilesService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);

  /**
   * Validates file signature (magic number), size, name, and stores in private vault
   */
  public async processUpload(
    originalFileName: string,
    mimeType: string,
    buffer: Buffer
  ): Promise<StoredAttachment> {
    // 1. Size constraint
    if (buffer.length > this.MAX_FILE_SIZE) {
      throw new Error(`File "${originalFileName}" exceeds the 5MB size limit (${(buffer.length / 1024 / 1024).toFixed(1)}MB).`);
    }

    if (buffer.length === 0) {
      throw new Error(`File "${originalFileName}" is empty.`);
    }

    // 2. MIME type allowlist
    if (!this.ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new Error(`Disallowed file type "${mimeType}". Only PDF, JPG, PNG, and WEBP documents are accepted.`);
    }

    // 3. Inspect actual binary magic bytes to prevent file spoofing
    this.verifyBinarySignature(buffer, mimeType, originalFileName);

    // 4. Sanitize file name to prevent path traversal
    const safeBaseName = path.basename(originalFileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    if (safeBaseName.includes('..') || safeBaseName.startsWith('.')) {
      throw new Error('Invalid file name: Path traversal detected.');
    }

    // 5. Generate secure server-side storage key
    const fileId = `file-${crypto.randomUUID()}`;
    const storageKey = `vault/${new Date().getFullYear()}/${crypto.randomBytes(16).toString('hex')}`;
    const checksumSha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    // 6. Quarantine inspection simulation
    const quarantineStatus: QuarantineStatus = this.scanBuffer(buffer) ? 'CLEARED' : 'FLAGGED';
    if (quarantineStatus === 'FLAGGED') {
      throw new Error('Upload rejected: File failed security signature heuristics.');
    }

    const storedAttachment: FileVaultEntry = {
      id: fileId,
      fileName: safeBaseName,
      fileSize: buffer.length,
      mimeType,
      storageKey,
      quarantineStatus,
      uploadedAt: new Date().toISOString(),
      checksumSha256,
      buffer,
      authorizedSessionTokens: new Set<string>(),
    };

    fileVault.set(fileId, storedAttachment);

    return {
      id: storedAttachment.id,
      fileName: storedAttachment.fileName,
      fileSize: storedAttachment.fileSize,
      mimeType: storedAttachment.mimeType,
      storageKey: storedAttachment.storageKey,
      quarantineStatus: storedAttachment.quarantineStatus,
      uploadedAt: storedAttachment.uploadedAt,
      checksumSha256: storedAttachment.checksumSha256,
    };
  }

  /**
   * Verify file binary signatures (magic bytes)
   */
  public verifyBinarySignature(buffer: Buffer, mimeType: string, fileName: string): void {
    if (mimeType === 'application/pdf') {
      // PDF must begin with %PDF- (0x25 0x50 0x44 0x46 0x2D)
      const isPdf =
        buffer.length >= 5 &&
        buffer[0] === 0x25 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x44 &&
        buffer[3] === 0x46 &&
        buffer[4] === 0x2d;

      if (!isPdf) {
        throw new Error(`File "${fileName}" does not match true PDF binary signature.`);
      }
    } else if (mimeType === 'image/png') {
      // PNG must begin with 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
      const isPng =
        buffer.length >= 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47;

      if (!isPng) {
        throw new Error(`File "${fileName}" does not match true PNG binary signature.`);
      }
    } else if (mimeType === 'image/jpeg') {
      // JPEG must begin with 0xFF 0xD8 0xFF
      const isJpg =
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff;

      if (!isJpg) {
        throw new Error(`File "${fileName}" does not match true JPEG binary signature.`);
      }
    } else if (mimeType === 'image/webp') {
      // WEBP starts with RIFF (0x52 0x49 0x46 0x46) and WEBP at byte 8 (0x57 0x45 0x42 0x50)
      const isWebp =
        buffer.length >= 12 &&
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46 &&
        buffer[8] === 0x57 &&
        buffer[9] === 0x45 &&
        buffer[10] === 0x42 &&
        buffer[11] === 0x50;

      if (!isWebp) {
        throw new Error(`File "${fileName}" does not match true WEBP binary signature.`);
      }
    }
  }

  private scanBuffer(buffer: Buffer): boolean {
    // Check for dangerous executable signatures (e.g. Windows MZ executable 0x4D 0x5A or ELF 0x7F 0x45 0x4C 0x46)
    if (buffer.length >= 2 && buffer[0] === 0x4d && buffer[1] === 0x5a) {
      return false;
    }
    if (buffer.length >= 4 && buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
      return false;
    }
    return true;
  }

  /**
   * Authorize a tracking session token to access a specific file
   */
  public authorizeAccess(fileId: string, trackingToken: string): void {
    const file = fileVault.get(fileId);
    if (file) {
      file.authorizedSessionTokens.add(trackingToken);
    }
  }

  /**
   * Retrieve file buffer only if authorized
   */
  public getFile(fileId: string, trackingToken?: string): FileVaultEntry {
    const file = fileVault.get(fileId);
    if (!file) {
      throw new Error('File not found in storage vault.');
    }

    if (!trackingToken || !file.authorizedSessionTokens.has(trackingToken)) {
      throw new Error('Unauthorized access: Valid tracking session authorization required.');
    }

    if (file.quarantineStatus !== 'CLEARED') {
      throw new Error('File is undergoing security quarantine.');
    }

    return file;
  }
}

export const filesService = new FilesService();
