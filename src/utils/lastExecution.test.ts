import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import { getLastExecutionTime, setLastExecutionTime } from "./lastExecution";

vi.mock("fs");

describe("lastExecution utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLastExecutionTime", () => {
    it("should return the date from the file if it exists and is valid", () => {
      const mockDateStr = "2023-10-27T10:00:00.000Z";
      vi.mocked(fs.readFileSync).mockReturnValue(mockDateStr);

      const result = getLastExecutionTime();

      expect(fs.readFileSync).toHaveBeenCalledWith("lastExecution.txt", "utf8");
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe(mockDateStr);
    });

    it("should return epoch 0 if the file reading fails", () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error("File not found");
      });

      const result = getLastExecutionTime();

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(0);
    });
  });

  describe("setLastExecutionTime", () => {
    it("should write the current date to the file", () => {
      const mockDate = new Date("2023-10-27T10:00:00.000Z");
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      setLastExecutionTime();

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        "lastExecution.txt",
        mockDate.toISOString(),
      );

      vi.useRealTimers();
    });
  });
});
