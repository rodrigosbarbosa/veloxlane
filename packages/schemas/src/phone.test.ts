import { describe, expect, it } from "vitest";

import { phoneSchema } from "./auth";
import { formatPhoneInput, isValidUsPhone, normalizeUsPhone } from "./phone";

describe("phoneSchema", () => {
  it("accepts bare, formatted, and +1 US numbers", () => {
    for (const phone of ["9737762354", "(973) 776-2354", "+19737762354"]) {
      expect(phoneSchema.safeParse({ phone }).success).toBe(true);
      expect(isValidUsPhone(phone)).toBe(true);
      expect(normalizeUsPhone(phone)).toBe("+19737762354");
    }
  });

  it("rejects numbers that are not 10 US digits after normalization", () => {
    for (const phone of ["123", "123456789", "123456789012", "abcdefghij"]) {
      expect(phoneSchema.safeParse({ phone }).success).toBe(false);
    }
  });

  it("accepts formatted display values from formatPhoneInput", () => {
    const formatted = formatPhoneInput("9737762354");
    expect(formatted).toBe("(973) 776-2354");
    expect(phoneSchema.safeParse({ phone: formatted }).success).toBe(true);
  });
});

describe("formatPhoneInput", () => {
  it("formats partial and complete US numbers", () => {
    expect(formatPhoneInput("")).toBe("");
    expect(formatPhoneInput("9")).toBe("(9");
    expect(formatPhoneInput("973")).toBe("(973");
    expect(formatPhoneInput("973776")).toBe("(973) 776");
    expect(formatPhoneInput("9737762354")).toBe("(973) 776-2354");
    expect(formatPhoneInput("+19737762354")).toBe("(973) 776-2354");
  });
});
