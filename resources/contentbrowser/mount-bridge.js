/* Runtime bridge for Svelte components registered from an add-on bundle.
 *
 * The Plone bundle (mockup <= 5.6.x) does not share its Svelte runtime via
 * module federation — a .svelte component compiled in an add-on carries its
 * own copy of the runtime. The host's mount() cannot execute a component
 * that was compiled against a different runtime instance (the component's
 * effects live in the other runtime's module state), which fails with
 * errors like "Cannot read properties of null (reading 'nodes')".
 *
 * This bridge wraps the component in a plain function with the Svelte
 * component calling convention: the host "mounts" it without touching any
 * Svelte internals, and we mount the real component into the same DOM slot
 * using OUR OWN runtime. Everything stays within one runtime — no shared
 * state needed.
 *
 * (Once mockup shares its Svelte runtime through module federation, this
 * bridge becomes unnecessary and components can be registered directly.)
 */
import { mount } from "svelte";

export function bridge(Component) {
    return function (anchor, props) {
        mount(Component, {
            target: anchor.parentNode,
            anchor: anchor,
            props: props,
        });
        return {};
    };
}
