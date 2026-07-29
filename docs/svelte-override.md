---
myst:
  html_meta:
    "description": "Override a Svelte component of the Blicca content browser via the shared @plone/registry, including the Svelte runtime bridge."
    "property=og:description": "Override a Svelte component of the Blicca content browser via the shared @plone/registry, including the Svelte runtime bridge."
    "property=og:title": "Overriding a Svelte component"
    "keywords": "Plone, Blicca, Svelte, contentbrowser, plone registry, componentRegistryKeys, module federation"
---

(blicca-svelte-override-label)=

# Overriding a Svelte component

The content browser is a Svelte app, and it is designed to be extended.
In this chapter, we replace its `SelectedItem` component with our own, and the selection list of every relation field renders with it.

## Where the hook is

The `pat-contentbrowser` looks up its `SelectedItem` component in the `@plone/registry` component registry.
It first checks a configurable registry key, and then falls back to the default component `pat-contentbrowser.SelectedItem`.

Our override consists of three building blocks.

## Block 1: the component

The file {file}`resources/contentbrowser/SelectedItem.svelte` contains our variant.
The only hard requirement is the props interface of the original:

```html
<script>
    let { item, unselectItem } = $props();
</script>
```

The component receives `item`, the selected object with its catalog metadata, and `unselectItem`, a callback that removes it from the selection.
Everything else, such as markup, badges, and styling, is yours.
The same technique applies to other Svelte-based parts of the stack, such as the file manager.

## Block 2: registration, with a runtime bridge

In {file}`resources/overrides.js`, we register the component under our own key:

```js
import plone_registry from "@plone/registry";
import BliccaSelectedItem from "./contentbrowser/SelectedItem.svelte";
import { bridge } from "./contentbrowser/mount-bridge";

plone_registry.registerComponent({
    name: "blicca.SelectedItem",
    component: bridge(BliccaSelectedItem),
});
```

Why the bridge?
The Plone bundle does not share its Svelte runtime through module federation.
A component compiled in the add-on carries its own copy of the runtime.
The host's `mount()` cannot execute a component from a foreign runtime, and fails with the following error:

```console
TypeError: Cannot read properties of null (reading 'nodes')
```

The bridge in {file}`resources/contentbrowser/mount-bridge.js` wraps the component in a plain function with the Svelte component calling convention.
The host mounts the wrapper without touching any Svelte internals, and the wrapper mounts the real component with the add-on's own runtime into the same DOM slot:

```js
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
```

```{note}
This is a great live debugging story.
Register the component once without the bridge, and watch the selection list render an empty slot with the error above.
Once Mockup shares its Svelte runtime through module federation, the bridge becomes unnecessary.
```

## Block 3: activation

The pattern option `componentRegistryKeys.selectedItem` tells the content browser which registry key to use.
We set it site-wide with the mechanism from {ref}`blicca-pattern-options-label`, in {file}`profiles/default/registry/patternoptions.xml`:

```xml
<element key="contentbrowser">{"componentRegistryKeys": {"selectedItem": "blicca.SelectedItem"}}</element>
```

Alternatively, set `data-pat-contentbrowser` directly on a single widget, or write an `IPatternsSettings` adapter for conditional activation.

## Exercise

Restyle the component in {file}`resources/contentbrowser/SelectedItem.svelte`.
Show the review state with your workflow colors, render bigger preview images, or turn the item into a compact table row.

Then edit any page, and open {menuselection}`Categorization --> Related Items`.
Select an item, and watch your component render the selection.
Remove the item with your own remove button, and observe that the field value updates.

## Checkpoint

The content browser selection renders with your component, and removing an item clears the field value.

```{tip}
The registration is lazy.
With a wrong registry key, the content browser silently falls back to the default component.
When "nothing happens", first check the key for typos.
```
