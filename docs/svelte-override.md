---
myst:
  html_meta:
    "description": "Override a Svelte component of the Blicca content browser via the shared @plone/registry and one shared Svelte runtime."
    "property=og:description": "Override a Svelte component of the Blicca content browser via the shared @plone/registry and one shared Svelte runtime."
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

## Block 2: registration

In {file}`resources/overrides.js`, we register the component under our own key:

```js
import plone_registry from "@plone/registry";
import BliccaSelectedItem from "./contentbrowser/SelectedItem.svelte";

plone_registry.registerComponent({
    name: "blicca.SelectedItem",
    component: BliccaSelectedItem,
});
```

One detail makes this work.
The host and the add-on share a single Svelte runtime through module federation.
Svelte keeps its reactivity state in module-level variables, so a component compiled against a second copy of the runtime cannot be mounted by the host.
Both webpack configurations therefore declare the same singleton shares: `svelte` for the package itself, and the prefix `svelte/` for the subpath imports of compiled components, such as `svelte/internal/client`.
This is the relevant part of {file}`webpack.config.js`:

```js
shared: {
    svelte: {
        singleton: true,
        requiredVersion: package_json.dependencies["svelte"],
    },
    "svelte/": {
        singleton: true,
        requiredVersion: package_json.dependencies["svelte"],
    },
},
```

```{important}
The Plone bundle shares its Svelte runtime since Mockup 5.7.
With an older bundle, the selection list renders an empty slot, and the console shows `TypeError: Cannot read properties of null (reading 'nodes')`.
```

This makes a great live debugging story, if time permits.
Remove the two shares from {file}`webpack.config.js`, rebuild, and watch the error appear.

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
