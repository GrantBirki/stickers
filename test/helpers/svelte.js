import { flushSync, mount, unmount as svelteUnmount } from "svelte";

const mounted = new Set();
const DEFAULT_TIMEOUT_MS = 1000;
const DEFAULT_INTERVAL_MS = 10;

const toMatcher = (matcher) => {
  if (matcher instanceof RegExp) {
    return (value) => matcher.test(value);
  }
  return (value) => value === String(matcher);
};

const normalizeText = (value) => value.replace(/\s+/g, " ").trim();

const elementName = (element) => normalizeText(element.getAttribute("aria-label") || element.textContent || "");

const textMatches = (element, matcher) => toMatcher(matcher)(normalizeText(element.textContent || ""));

const hasMatchingChildText = (element, matcher) =>
  Array.from(element.children).some((child) => textMatches(child, matcher));

const requireOne = (items, description) => {
  if (items.length === 0) {
    throw new Error(`Unable to find ${description}`);
  }
  return items[0];
};

const queryAllByRole = (role, options = {}, root = document.body) => {
  const candidates = [];
  if (role === "heading") {
    candidates.push(...root.querySelectorAll("h1,h2,h3,h4,h5,h6,[role='heading']"));
  } else if (role === "link") {
    candidates.push(...root.querySelectorAll("a[href],[role='link']"));
  } else if (role === "switch") {
    candidates.push(...root.querySelectorAll("[role='switch']"));
  } else {
    candidates.push(...root.querySelectorAll(`[role='${role}']`));
  }

  return candidates.filter((element) => {
    if (options.level !== undefined) {
      const implicitLevel = /^H[1-6]$/.test(element.tagName) ? Number(element.tagName.slice(1)) : undefined;
      const explicitLevel = element.getAttribute("aria-level");
      const level = explicitLevel === null ? implicitLevel : Number(explicitLevel);
      if (level !== options.level) return false;
    }
    if (options.name !== undefined && !toMatcher(options.name)(elementName(element))) return false;
    return true;
  });
};

const queryAllByText = (matcher, root = document.body) =>
  Array.from(root.querySelectorAll("*")).filter((element) => textMatches(element, matcher) && !hasMatchingChildText(element, matcher));

const queryAllByLabelText = (matcher, root = document.body) =>
  Array.from(root.querySelectorAll("[aria-label]")).filter((element) => toMatcher(matcher)(element.getAttribute("aria-label") || ""));

const queryAllByAltText = (matcher, root = document.body) =>
  Array.from(root.querySelectorAll("img[alt]")).filter((element) => toMatcher(matcher)(element.getAttribute("alt") || ""));

const queryAllByTestId = (testId, root = document.body) => Array.from(root.querySelectorAll(`[data-testid='${testId}']`));

const findBy = async (callback) =>
  waitFor(() => {
    const item = callback();
    if (!item) throw new Error("not found");
    return item;
  });

export const screen = {
  getByRole: (role, options) => requireOne(queryAllByRole(role, options), `role ${role}`),
  queryByRole: (role, options) => queryAllByRole(role, options)[0] || null,
  findByRole: (role, options) => findBy(() => screen.queryByRole(role, options)),
  getByText: (matcher) => requireOne(queryAllByText(matcher), `text ${matcher}`),
  queryByText: (matcher) => queryAllByText(matcher)[0] || null,
  findByText: (matcher) => findBy(() => screen.queryByText(matcher)),
  getByLabelText: (matcher) => requireOne(queryAllByLabelText(matcher), `label ${matcher}`),
  queryByLabelText: (matcher) => queryAllByLabelText(matcher)[0] || null,
  findByLabelText: (matcher) => findBy(() => screen.queryByLabelText(matcher)),
  getByAltText: (matcher) => requireOne(queryAllByAltText(matcher), `alt text ${matcher}`),
  queryByAltText: (matcher) => queryAllByAltText(matcher)[0] || null,
  findByAltText: (matcher) => findBy(() => screen.queryByAltText(matcher)),
  getAllByTestId: (testId) => {
    const items = queryAllByTestId(testId);
    if (items.length === 0) throw new Error(`Unable to find test id ${testId}`);
    return items;
  },
};

export const render = (Component, options = {}) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const component = mount(Component, { target: container, props: options.props || {} });
  flushSync();
  const record = { component, container };
  mounted.add(record);

  return {
    component,
    container,
    unmount: () => cleanupRecord(record),
  };
};

const cleanupRecord = (record) => {
  if (!mounted.has(record)) return;
  svelteUnmount(record.component);
  flushSync();
  record.container.remove();
  mounted.delete(record);
};

export const cleanup = () => {
  for (const record of Array.from(mounted)) {
    cleanupRecord(record);
  }
};

const dispatch = (element, event) => {
  element.dispatchEvent(event);
  flushSync();
  return Promise.resolve();
};

const makeMouseEvent = (type, init = {}) => new MouseEvent(type, { bubbles: true, cancelable: true, ...init });
const makePointerEvent = (type, init = {}) => {
  const EventCtor = window.PointerEvent || MouseEvent;
  return new EventCtor(type, { bubbles: true, cancelable: true, ...init });
};
const makeFocusEvent = (type, init = {}) => new FocusEvent(type, { bubbles: false, cancelable: false, ...init });

export function fireEvent(element, event) {
  return dispatch(element, event);
}

fireEvent.blur = (element, init) => dispatch(element, makeFocusEvent("blur", init));
fireEvent.click = (element, init) => dispatch(element, makeMouseEvent("click", init));
fireEvent.load = (element, init) => dispatch(element, new Event("load", { bubbles: false, cancelable: false, ...init }));
fireEvent.mouseOut = (element, init) => dispatch(element, makeMouseEvent("mouseout", init));
fireEvent.pointerDown = (element, init) => dispatch(element, makePointerEvent("pointerdown", init));
fireEvent.pointerMove = (element, init) => dispatch(element, makePointerEvent("pointermove", init));
fireEvent.touchStart = (element, init) => dispatch(element, new Event("touchstart", { bubbles: true, cancelable: true, ...init }));

export const waitFor = async (callback, options = {}) => {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
  const interval = options.interval ?? DEFAULT_INTERVAL_MS;
  const started = Date.now();
  let lastError;

  while (Date.now() - started <= timeout) {
    try {
      return callback();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  throw lastError || new Error("Timed out in waitFor");
};
