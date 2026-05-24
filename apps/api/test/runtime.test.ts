import { describe, expect, it, vi } from "vitest";

import { createShutdownHandler, registerShutdownSignals } from "../src/runtime";

const createExitMock = () => {
  const exitSignal = new Error("process.exit");
  const exit = vi.fn<NodeJS.Process["exit"]>(
    (_code?: string | number | null) => {
      throw exitSignal;
    },
  );

  return { exit, exitSignal };
};

describe("API runtime shutdown", () => {
  it("registers SIGINT and SIGTERM handlers", () => {
    const on = vi.fn();
    const { exit } = createExitMock();

    registerShutdownSignals({
      process: {
        exit,
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
    const { exit, exitSignal } = createExitMock();
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

    expect(() => handler("SIGTERM")).toThrow(exitSignal);
    expect(() => handler("SIGINT")).not.toThrow();

    expect(close).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledTimes(1);
  });
});
