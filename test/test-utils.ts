import assert from "node:assert/strict";
import { beforeEach, afterEach, mock, test } from "node:test";

type Callable = (...args: any[]) => any;
type MockCall = { arguments: unknown[] } | unknown[];
type MockFunction = Callable & {
  mock: {
    calls: MockCall[];
    mockImplementation: (implementation: Callable) => void;
    resetCalls: () => void;
    restore: () => void;
  };
  mockClear: () => MockFunction;
  mockImplementation: (implementation: Callable) => MockFunction;
  mockRestore: () => void;
};

const adaptMock = (fn: MockFunction): MockFunction => {
  fn.mockClear = () => {
    fn.mock.resetCalls();
    return fn;
  };
  fn.mockImplementation = (implementation) => {
    fn.mock.mockImplementation(implementation);
    return fn;
  };
  fn.mockRestore = () => fn.mock.restore();
  return fn;
};

const globalDescriptors = new Map<PropertyKey, PropertyDescriptor | undefined>();
let fakeTimersEnabled = false;

export const vi = {
  fn: (implementation?: Callable) => adaptMock(mock.fn(implementation) as MockFunction),
  spyOn: (target: object, key: PropertyKey) =>
    adaptMock(mock.method(target as Record<PropertyKey, Callable>, key) as MockFunction),
  stubGlobal: (key: PropertyKey, value: unknown) => {
    if (!globalDescriptors.has(key)) {
      globalDescriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    }
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  },
  restoreAllMocks: () => mock.restoreAll(),
  unstubAllGlobals: () => {
    for (const [key, descriptor] of globalDescriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    globalDescriptors.clear();
  },
  useFakeTimers: () => {
    if (fakeTimersEnabled) return;
    mock.timers.enable({ apis: ["Date", "setInterval", "setTimeout"] });
    fakeTimersEnabled = true;
  },
  useRealTimers: () => {
    if (!fakeTimersEnabled) return;
    mock.timers.reset();
    fakeTimersEnabled = false;
  },
  runOnlyPendingTimers: () => mock.timers.runAll(),
  advanceTimersByTime: (milliseconds: number) => mock.timers.tick(milliseconds),
};

const callsFor = (fn: MockFunction): unknown[][] =>
  fn.mock.calls.map((call) => (Array.isArray(call) ? call : call.arguments));

const check = (negated: boolean, assertion: () => void) => {
  if (!negated) {
    assertion();
    return;
  }
  assert.throws(assertion);
};

const matchers = (actual: unknown, negated = false) => ({
  get not() {
    return matchers(actual, !negated);
  },
  toBe(expected: unknown) {
    check(negated, () => assert.strictEqual(actual, expected));
  },
  toEqual(expected: unknown) {
    check(negated, () => assert.deepStrictEqual(actual, expected));
  },
  toBeTruthy() {
    check(negated, () => assert.ok(actual));
  },
  toMatch(expected: RegExp | string) {
    check(negated, () => {
      if (expected instanceof RegExp) assert.match(String(actual), expected);
      else assert.ok(String(actual).includes(expected));
    });
  },
  toBeGreaterThan(expected: number) {
    check(negated, () => assert.ok(typeof actual === "number" && actual > expected));
  },
  toHaveBeenCalled() {
    check(negated, () => assert.ok(callsFor(actual as MockFunction).length > 0));
  },
  toHaveBeenCalledTimes(expected: number) {
    check(negated, () => assert.strictEqual(callsFor(actual as MockFunction).length, expected));
  },
  toHaveBeenCalledWith(...expected: unknown[]) {
    check(negated, () => {
      assert.ok(callsFor(actual as MockFunction).some((call) => {
        try {
          assert.deepStrictEqual(call, expected);
          return true;
        } catch {
          return false;
        }
      }));
    });
  },
});

export const expect = (actual: unknown) => ({
  ...matchers(actual),
  rejects: {
    async toThrow(expected?: RegExp | string) {
      await assert.rejects(
        actual as Promise<unknown>,
        expected instanceof RegExp ? expected : expected ? { message: expected } : undefined,
      );
    },
  },
});

export { afterEach, beforeEach, test };
