import { z } from "zod";

export const FileSchema = z.object({
  id: z.number().int().positive(),
  owner_id: z.number().int().positive(),
  entity_id: z.string(),
  path: z.string(),
  size: z.string(),
  md5: z.string(),
  uploaded_at: z.iso.datetime(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type File = z.infer<typeof FileSchema>;
