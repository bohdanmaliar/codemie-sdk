import { describe, expect, it } from "@jest/globals";
import { HeadroomConfigSchema } from "../../../src/schemas/headroom";
import {
  AssistantCreateParamsSchema,
  AssistantUpdateParamsSchema,
} from "../../../src/schemas/assistant";
import type {
  Assistant,
  HeadroomConfig,
  HeadroomOverride,
  HeadroomSavings,
  HistoryItem,
  TokensUsage,
  Workflow,
} from "../../../src/models";
import { WorkflowMode } from "../../../src/models/workflow";

const VALID = {
  name: "A",
  description: "D",
  system_prompt: "P",
  project: "proj",
  context: [],
  llm_model_type: "gpt-4",
  toolkits: [],
  conversation_starters: [],
  assistant_ids: [],
  mcp_servers: [],
};

describe("HeadroomConfigSchema", () => {
  it("accepts a partial config", () => {
    expect(HeadroomConfigSchema.parse({ enabled: true })).toEqual({ enabled: true });
  });

  it("accepts every strategy literal", () => {
    for (const strategy of ["lossless", "balanced", "aggressive"] as const) {
      expect(HeadroomConfigSchema.parse({ strategy }).strategy).toBe(strategy);
    }
  });

  it("rejects an unknown strategy", () => {
    expect(() => HeadroomConfigSchema.parse({ strategy: "bogus" })).toThrow();
  });
});

describe("headroom_config on assistant params", () => {
  it("keeps headroom_config on create", () => {
    const parsed = AssistantCreateParamsSchema.parse({
      ...VALID,
      headroom_config: { enabled: true, strategy: "aggressive" },
    });
    expect(parsed.headroom_config).toEqual({ enabled: true, strategy: "aggressive" });
  });

  it("keeps headroom_config on update", () => {
    const parsed = AssistantUpdateParamsSchema.parse({
      ...VALID,
      headroom_config: { compress_tool_outputs: false },
    });
    expect(parsed.headroom_config).toEqual({ compress_tool_outputs: false });
  });

  it("leaves the key absent when not provided (update must not reset it)", () => {
    expect("headroom_config" in AssistantCreateParamsSchema.parse(VALID)).toBe(false);
    expect("headroom_config" in AssistantUpdateParamsSchema.parse(VALID)).toBe(false);
  });

  it("rejects an unknown strategy", () => {
    expect(() =>
      AssistantCreateParamsSchema.parse({ ...VALID, headroom_config: { strategy: "bogus" } }),
    ).toThrow();
  });
});

describe("headroom model types", () => {
  it("compile on Assistant, Workflow, HistoryItem and TokensUsage", () => {
    const config: HeadroomConfig = {
      enabled: true,
      compress_user_messages: true,
      compress_tool_outputs: false,
      strategy: "lossless",
    };
    const override: HeadroomOverride = { strategy: "aggressive" };
    const savings: HeadroomSavings = {
      tokens_original: 100,
      tokens_compacted: 60,
      tokens_saved: 40,
      mode: "mixed",
      strategy: null,
      calls: 2,
    };
    const assistant: Pick<Assistant, "headroom_config"> = { headroom_config: config };
    const workflow: Pick<Workflow, "headroom_config" | "mode"> = {
      headroom_config: override,
      mode: WorkflowMode.SEQUENTIAL,
    };
    const history: Pick<HistoryItem, "headroom"> = { headroom: savings };
    const usage: TokensUsage = { headroom: savings };

    expect(assistant.headroom_config?.strategy).toBe("lossless");
    expect(workflow.headroom_config?.strategy).toBe("aggressive");
    expect(history.headroom?.mode).toBe("mixed");
    expect(usage.headroom?.calls).toBe(2);
  });
});
