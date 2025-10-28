import { z } from "zod";

export const PositionStatusSchema = z.enum(["OPEN", "CLOSED", "LIQUIDATED"]);
export type PositionStatus = z.infer<typeof PositionStatusSchema>;

export const SideSchema = z.enum(["BUY", "SELL"]);
export type Side = z.infer<typeof SideSchema>;
