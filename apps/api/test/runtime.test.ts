import { describe, expect, it, vi } from "vitest";

import { createShutdownHandler, registerShutdownSignals } from "../src/runtime";

describe("API runtime shutdown", () => {
  it("registers SIGINT and SIGTERM handlers", () => {
    const on = vi.fn();

    registerShutdownSignals({
      process: {
        exit: vi.fn(),
        exitCode: undefined,
        on,
      },
      server: {
        close: vi.fn(),
      } as never,
    });

    expect(on).toHaveBeenCalledTimes(2);
    expect(on).toHaveBeenNthCalledWith(1, "SIGINT", expect.any(Function));
    expect(on).toHaveBeenNthCalledWith(2, "SIGTERM", expect.any(Function));
  });

  it("closes the server and exits once on shutdown", () => {
    const close = vi.fn((callback?: (error?: Error) => void) => {
      callback?.();
      return {} as never;
    });
    const exit = vi.fn();
    const handler = createShutdownHandler({
      process: {
        exit,
        exitCode: undefined,
        on: vi.fn(),
      },
      server: {
        close,
      } as never,
    });

    handler("SIGTERM");
    handler("SIGINT");

    expect(close).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledTimes(1);
  });
});
