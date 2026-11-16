export type HeadroomStrategy = "lossless" | "balanced" | "aggressive";

/** Headroom (token compression) settings stored on an assistant. LangGraphAgent runs only. */
export interface HeadroomConfig {
  enabled?: boolean;
  compress_user_messages?: boolean;
  compress_tool_outputs?: boolean;
  strategy?: HeadroomStrategy;
}

/** Partial Headroom settings, for example on a workflow. */
export interface HeadroomOverride {
  enabled?: boolean;
  compress_user_messages?: boolean;
  compress_tool_outputs?: boolean;
  strategy?: HeadroomStrategy;
}

/** Token savings reported for a message or an execution. */
export interface HeadroomSavings {
  tokens_original: number;
  tokens_compacted: number;
  tokens_saved: number;
  mode: string;
  strategy?: string | null;
  calls?: number;
}
