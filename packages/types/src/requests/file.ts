import { z } from "zod";
import { FileSchema } from "../entities";

export const CreateFileRequestSchema = z.object({
  owner_id: z.number().int().positive(),
  entity_id: z.string(),
  path: z.string(),
  size: z.string(),
  md5: z.string(),
});
export type CreateFileRequest = z.infer<typeof CreateFileRequestSchema>;

export const UpdateFileRequestSchema = z.object({
  filename: z.string().min(1).optional(),
  file_type: z.string().min(1).optional(),
  file_size: z.number().int().positive().optional(),
  mime_type: z.string().min(1).optional(),
  is_public: z.boolean().optional(),
});
export type UpdateFileRequest = z.infer<typeof UpdateFileRequestSchema>;

export const FileUploadRequestSchema = z.object({
  file: z.any(), // File object from FormData
  entity_id: z.string().optional(),
  is_public: z.boolean().default(false),
});
export type FileUploadRequest = z.infer<typeof FileUploadRequestSchema>;

export const FileUploadResponseSchema = FileSchema.extend({
  filename: z.string(),
  url: z.string().url(),
});
export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>;

export const FileListResponseSchema = z.object({
  files: z.array(FileSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export type FileListResponse = z.infer<typeof FileListResponseSchema>;
