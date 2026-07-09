# blicca.staticresourceoverride

Training add-on for the Plone Conference: **Simple ways to override patterns
and Svelte components of Plone Blicca (formerly Classic UI).**

Once installed in Plone, all customizations are active — without touching
`plone.staticresources` or the Mockup package itself.

## How the Blicca JS stack works (in a nutshell)

- **Mockup** (`@plone/mockup`) is the JS package behind the Plone bundle
  (`++plone++static/bundle-plone/bundle.min.js`, registered as bundle
  `plone`).
- Patterns are registered in the **Patternslib registry** and initialized
  during the DOM scan via their **trigger** (a CSS selector, e.g.
  `.pat-tinymce`). Rule of thumb: **first registration wins** — whoever
  registers first, wins.
- The Plone bundle is a **module federation host**: add-on bundles
  ("remotes") are initialized automatically on *document-ready* and **share
  the core modules** with the host (Patternslib registry, `@plone/registry`,
  jQuery, Bootstrap, Svelte runtime …). This way add-on and core talk to the
  same registry instances.
- Newer patterns (e.g. `pat-contentbrowser`) are **Svelte apps**. They pull
  some of their sub-components from the **`@plone/registry` component
  registry** — and that is exactly where add-ons can hook in their own
  components.

## The four override techniques in this add-on

### 1. Override a Svelte component (demo: content browser `SelectedItem`)

The `pat-contentbrowser` first looks up its `SelectedItem` component under a
configurable registry key before falling back to the default
(`pat-contentbrowser.SelectedItem`).

Three building blocks:

1. Your own component with the **same props interface** as the original:
   [`resources/contentbrowser/SelectedItem.svelte`](resources/contentbrowser/SelectedItem.svelte)
2. Registration in the shared component registry
   ([`resources/overrides.js`](resources/overrides.js)):

   ```js
   import plone_registry from "@plone/registry";
   plone_registry.registerComponent({
       name: "blicca.SelectedItem",
       component: BliccaSelectedItem,
   });
   ```

3. Activation via the pattern option `componentRegistryKeys.selectedItem` —
   site-wide and purely declarative through the registry record
   `plone.patternoptions`
   ([`profiles/default/registry/patternoptions.xml`](src/blicca/staticresourceoverride/profiles/default/registry/patternoptions.xml)).
   Plone renders these options as a `data-pat-contentbrowser` attribute on
   the `<body>`; the options parser inherits them down to every pattern
   element.

> Alternatively per field/widget: set `data-pat-contentbrowser` directly on
> the widget, or conditionally via an `IPatternsSettings` adapter (see
> `Products.CMFPlone.patterns.settings` as a template).

### 2. Change pattern options globally — without any JavaScript

The record `plone.patternoptions` (dict: pattern name → JSON) puts options
as `data-pat-*` attributes on the `<body>`. Example — Plone itself
configures `pickadate` and `plone-modal` this way. Simply add your own
entries via `registry.xml` (don't forget `purge="false"`, otherwise you wipe
the entries of other packages!). For many training use cases this already is
the whole solution.

### 3. Register your own pattern (demo: `pat-blicca`)

[`resources/pat-blicca/blicca.js`](resources/pat-blicca/blicca.js) — a
class-based pattern in the current Patternslib style (`BasePattern` +
`Parser`). After `registry.register(Pattern)` the registry also scans
dynamically loaded content (modals, `pat-inject`, folder contents)
automatically.

Try it: give a paragraph the class `pat-blicca` in TinyMCE, or put
`<p class="pat-blicca" data-pat-blicca="color: #d63384">…</p>` in a template.

### 4. Replace a core pattern entirely (demo: `markspeciallinks`)

Because the Patternslib registry follows "first registration wins" and the
load order of async chunks is not guaranteed, there is an official switch for
this: the **pattern blacklist**.

Three building blocks:

1. [`static/pattern-blacklist.js`](src/blicca/staticresourceoverride/static/pattern-blacklist.js)
   — a tiny, **unbuilt** JS file, registered as its own synchronous bundle.
   It fills `window.__patternslib_patterns_blacklist` before Mockup registers
   its patterns (in an async chunk). The original therefore never gets
   registered.
2. [`resources/markspeciallinks/markspeciallinks.js`](resources/markspeciallinks/markspeciallinks.js)
   — extends the original class (code reuse), registers itself under its
   **own name** (`blicca-markspeciallinks` — the original name is
   blacklisted, after all), but with the **original trigger**
   `.pat-markspeciallinks`.
3. Options bridge: since the Mockup parser reads options based on the
   pattern name, our `init()` fetches the original's options
   (`data-pat-markspeciallinks`, including inheritance from the `<body>`)
   itself via `mockupParser.getOptions()`.

Visible result: external links get the icon `box-arrow-up-right` instead of
`link-45deg`.

## How everything reaches Plone

- [`configure.zcml`](src/blicca/staticresourceoverride/configure.zcml):
  `plone:static` publishes the `static/` directory as
  `++plone++blicca.staticresourceoverride/…`
- [`profiles/default/registry/bundles.xml`](src/blicca/staticresourceoverride/profiles/default/registry/bundles.xml)
  registers two bundles:
  - `blicca-preload` → the blacklist file (synchronous, without `depends`,
    rendered before the `plone` bundle)
  - `blicca-staticresourceoverride` → the built module federation remote
    (`depends: plone`)
- Uninstall: the bundle records are removed via `remove="true"`, the
  `plone.patternoptions` entry in the `post_uninstall` handler
  ([`setuphandlers.py`](src/blicca/staticresourceoverride/setuphandlers.py)).

## Build & installation

### Build the JavaScript

```bash
cd src/blicca.staticresourceoverride
npm install
npm run build    # → src/blicca/staticresourceoverride/static/bundles/
```

For development: `npm run watch` (rebuilds on change; in Plone a browser
reload is enough then, as long as `plone.resources.development` is enabled
or the resource cache is bypassed).

**Important:** The versions of `@plone/mockup` and
`@patternslib/patternslib` in [`package.json`](package.json) have to match
the Mockup version shipped with `plone.staticresources` — module federation
negotiates shared modules via version ranges. So keep them in sync on Plone
upgrades and rebuild.

### Install in Plone

```bash
pip install -e src/blicca.staticresourceoverride   # or add it to your buildout
```

Then restart the instance and install the add-on **"Blicca Static Resource
Override (Training)"** in the add-ons control panel (or via `portal_setup`).

### Checklist for the live demo

1. External links on a page → new icon (demo 4 + blacklist).
2. Paragraph with class `pat-blicca` → badge + outline (demo 3).
3. Open the content browser on a relation/image field, select items →
   the selection renders with the Blicca `SelectedItem` component
   (demo 1 + 2).
4. Browser console: `Patternslib Module Federation: Loaded and initialized
   bundle "__patternslib_mf__bliccastaticresourceoverride"` confirms that
   the host has loaded the remote.

## Known pitfalls

- **Forgotten build**: `static/bundles/` is empty → 404 for the remote
  bundle. Run `npm run build` first, then install.
- **Version drift**: If the add-on's Patternslib version diverges too far
  from the Plone bundle's, module federation loads two instances — then
  registrations end up in the "wrong" registry. Check the console for MF
  warnings.
- Omitting **`purge="false"`** on `plone.patternoptions` overwrites the
  options of the Plone core and other add-ons.
- The Svelte component registration is *lazy*: the content browser falls
  back to the default component if the key is not (yet) registered — a typo
  in the registry key therefore only shows up as "nothing happens".
