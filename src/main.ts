import App from "./App.svelte";
import { mount } from "svelte";

const target = document.getElementById("app");
if (!target) throw new Error("Missing #app mount target");

// Svelte 5 uses `mount()` (the `new Component(...)` API is no longer valid by default).
const app = mount(App, { target });

export default app;
