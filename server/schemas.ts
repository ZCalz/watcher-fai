import { z } from "zod";

export const PastProtocolsActionSchema = z
  .object({})
  .strip()
  .describe("Input schema for retrieving account details");