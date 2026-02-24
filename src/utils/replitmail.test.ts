import { describe, it, expect } from "vitest";
import { zSmtpMessage } from "./replitmail";

describe("zSmtpMessage Schema", () => {
  const validBaseMessage = {
    to: "test@example.com",
    subject: "Test Subject",
    text: "Hello, this is a test email.",
  };

  it("should validate a valid message with a single recipient", () => {
    const result = zSmtpMessage.safeParse(validBaseMessage);
    expect(result.success).toBe(true);
  });

  it("should validate a valid message with multiple recipients in an array", () => {
    const message = {
      ...validBaseMessage,
      to: ["test1@example.com", "test2@example.com"],
    };
    const result = zSmtpMessage.safeParse(message);
    expect(result.success).toBe(true);
  });

  it("should validate a valid message with CC", () => {
    const message = {
      ...validBaseMessage,
      cc: "cc@example.com",
    };
    const result = zSmtpMessage.safeParse(message);
    expect(result.success).toBe(true);

    const messageArray = {
      ...validBaseMessage,
      cc: ["cc1@example.com", "cc2@example.com"],
    };
    const resultArray = zSmtpMessage.safeParse(messageArray);
    expect(resultArray.success).toBe(true);
  });

  it("should validate a valid message with HTML body", () => {
    const message = {
      ...validBaseMessage,
      html: "<h1>Hello</h1><p>this is a test email.</p>",
    };
    const result = zSmtpMessage.safeParse(message);
    expect(result.success).toBe(true);
  });

  it("should validate a valid message with attachments", () => {
    const message = {
      ...validBaseMessage,
      attachments: [
        {
          filename: "test.txt",
          content: "SGVsbG8gV29ybGQ=", // Base64 for "Hello World"
          contentType: "text/plain",
        },
        {
          filename: "test2.txt",
          content: "SGVsbG8gV29ybGQ=",
          encoding: "base64" as const,
        },
      ],
    };
    const result = zSmtpMessage.safeParse(message);
    expect(result.success).toBe(true);
  });

  it("should invalidate a message missing the 'to' field", () => {
    const { to, ...invalidMessage } = validBaseMessage as any;
    const result = zSmtpMessage.safeParse(invalidMessage);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("to");
    }
  });

  it("should invalidate a message with an invalid email address", () => {
    const invalidMessage = {
      ...validBaseMessage,
      to: "not-an-email",
    };
    const result = zSmtpMessage.safeParse(invalidMessage);
    expect(result.success).toBe(false);
  });

  it("should invalidate a message with an invalid email address in an array", () => {
    const invalidMessage = {
      ...validBaseMessage,
      to: ["valid@example.com", "not-an-email"],
    };
    const result = zSmtpMessage.safeParse(invalidMessage);
    expect(result.success).toBe(false);
  });

  it("should invalidate a message missing the 'subject' field", () => {
    const { subject, ...invalidMessage } = validBaseMessage as any;
    const result = zSmtpMessage.safeParse(invalidMessage);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("subject");
    }
  });

  it("should invalidate an attachment with an invalid encoding", () => {
    const message = {
      ...validBaseMessage,
      attachments: [
        {
          filename: "test.txt",
          content: "SGVsbG8gV29ybGQ=",
          encoding: "invalid-encoding" as any,
        },
      ],
    };
    const result = zSmtpMessage.safeParse(message);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("attachments");
    }
  });
});
