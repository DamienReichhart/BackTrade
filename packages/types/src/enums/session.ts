import { z } from "zod";

export const SessionStatusSchema = z.enum([
  "DRAFT",
  "RUNNING",
  "PAUSED",
  "COMPLETED",
  "ARCHIVED",
]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const TimeframeSchema = z.enum([
  "M1",
  "M5",
  "M10",
  "M15",
  "M30",
  "H1",
  "H2",
  "H4",
  "D1",
  "W1",
]);
export type Timeframe = z.infer<typeof TimeframeSchema>;

export const SpeedSchema = z.enum([
  "0.5x",
  "1x",
  "2x",
  "3x",
  "5x",
  "10x",
  "15x",
]);
export type Speed = z.infer<typeof SpeedSchema>;
