import { z } from "zod";

export const HeadroomConfigSchema = z.object({
  enabled: z.boolean().optional(),
  compress_user_messages: z.boolean().optional(),
  compress_tool_outputs: z.boolean().optional(),
  strategy: z.enum(["lossless", "balanced", "aggressive"]).optional(),
});
