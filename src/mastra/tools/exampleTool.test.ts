import { describe, it, expect } from "vitest";
import { exampleTool } from "./exampleTool";

describe("exampleTool", () => {
  it("should uppercase the message and count words/characters", async () => {
    const input = {
      message: "hello world",
    };

    const result = await exampleTool.execute({
      context: input,
      suspend: async () => {}, // Mock suspend
      runId: "test-run-id", // Mock runId
    });

    expect(result.processed).toBe("HELLO WORLD");
    expect(result.metadata.characterCount).toBe(11);
    expect(result.metadata.wordCount).toBe(2);
  });

  it("should handle extra optional parameters without error", async () => {
    const input = {
      message: "test",
      count: 123,
    };

    const result = await exampleTool.execute({
      context: input,
      suspend: async () => {}, // Mock suspend
      runId: "test-run-id", // Mock runId
    });

    expect(result.processed).toBe("TEST");
    expect(result.metadata.characterCount).toBe(4);
    expect(result.metadata.wordCount).toBe(1);
  });
});
