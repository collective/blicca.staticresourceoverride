# blicca.staticresourceoverride

Training add-on for the Plone Conference: **Simple ways to override patterns
and Svelte components of Plone Blicca (formerly known as Classic UI).**

Once installed in Plone, all customizations are active — without touching
`plone.staticresources` or the Mockup package itself.

> Running this as a half-day training? See [TRAINING.md](TRAINING.md) for
> the 4-hour schedule, the exercises and the `step-1` … `step-4` git tags
> that mirror the training blocks.

## How the Blicca JS stack works (in a nutshell)

- **Mockup** (`@plone/mockup`) is the JS package behind the Plone bundle
  (`++plone++static/bundle-plone/bundle.min.js`, registered as bundle
  `plone`) in Plone's **resource registry (@@resourceregistry-controlpanel)**.
- Patterns are registered in the **Patternslib registry** and initialized
  during the DOM scan via their **trigger** (a CSS selector, e.g.
  `.pat-tinymce`). Rule of thumb: **first registration wins** — whoever
  registers first, wins.
- The Plone bundle is a **module federation host**: add-on bundles
  ("remotes") are initialized automatically on _document-ready_ and **share
  the core modules** with the host (Patternslib registry, `@plone/registry`,
  jQuery, Bootstrap, Svelte runtime …). This way add-on and core talk to the
  same registry instances.
- Newer patterns (e.g. `pat-contentbrowser`) are **Svelte apps**. They pull
  some of their sub-components from the **`@plone/registry` component
  registry** — and that is exactly where add-ons can hook in their own
  components.

## The four override techniques in this add-on

### 1. Change pattern options globally — without any JavaScript

The record `plone.patternoptions` (dict: pattern name → JSON) puts options
as `data-pat-*` attributes on the `<body>`. Plone itself configures
`pickadate` and `plone-modal` this way. Simply add your own entries via
`registry.xml` (don't forget `purge="false"`, otherwise you wipe the
entries of other packages!). For many use cases this already is the whole
solution.

This add-on ships an example in
[`profiles/default/registry/patternoptions.xml`](src/blicca/staticresourceoverride/profiles/default/registry/patternoptions.xml):
external links open in a new window (`markspeciallinks` entry). Note that a
`plone.patternoptions` entry overrides what Plone's `IPatternsSettings`
adapters render on the `<body>` for the same pattern — powerful, but be
deliberate.

One catch, worth understanding: options alone don't run a pattern — the
**trigger class** has to be present. The `pat-markspeciallinks` class - a Pattern trigger class - on
the `<body>` is only rendered when one of Plone's link settings is enabled.
This tutorial's profile sets `plone.mark_special_links` to enable the Pattern
([`linksettings.xml`](src/blicca/staticresourceoverride/profiles/default/registry/linksettings.xml));
without it neither the original pattern nor our step 3 replacement would
ever run.

### 2. Register your own pattern (demo: `pat-blicca`)

[`resources/pat-blicca/blicca.js`](resources/pat-blicca/blicca.js) — a
class-based pattern in the current Patternslib style (`BasePattern` +
`Parser`). After `registry.register(Pattern)` the registry also scans
dynamically loaded content (modals, `pat-inject`, folder contents)
automatically.

Try it: give a paragraph the class `pat-blicca` in TinyMCE, or put
`<p class="pat-blicca" data-pat-blicca="color: #d63384">…</p>` in a template.

### 3. Replace a core pattern entirely (demo: `markspeciallinks`)

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

Since Patternslib 9.11 (Mockup 5.6.12 and later) there is a shorter way:
`replace: true` as pattern property (or
`registry.register(Pattern, name, { replace: true })`) replaces the
registration under the **same name**, so the preload bundle and the options
bridge are not needed. The registry waits for the module federation remotes
before its initial scan, so the replacement is in place from the start. The
blacklist still wins over a replacement. This add-on keeps the blacklist
recipe because it works on every Mockup 5 bundle.

### 4. Override a Svelte component (demo: content browser `SelectedItem`)

The `pat-contentbrowser` looks up its `SelectedItem` component in the
`@plone/registry` component registry — first under a configurable key, then
under the default key `pat-contentbrowser.SelectedItem`. Both keys are hooks
for add-ons.

Two building blocks:

1. Your own component with the **same props interface** as the original:
   [`resources/contentbrowser/SelectedItem.svelte`](resources/contentbrowser/SelectedItem.svelte)
2. Registration under the **default key** in the shared component registry
   ([`resources/overrides.js`](resources/overrides.js)):

    ```js
    import plone_registry from "@plone/registry";
    plone_registry.registerComponent({
        name: "pat-contentbrowser.SelectedItem",
        component: BliccaSelectedItem,
    });
    ```

    That replaces the component site-wide, without any configuration. Since
    Mockup 5.6.11 the pattern registers its own default component only if
    nothing is registered under that key yet, so the add-on registration
    wins no matter whether the add-on bundle initializes before or after
    the pattern. (Older bundles re-registered the default on every widget
    initialization — there, only the custom key below works.)

    This works because host and add-on share **one Svelte runtime** via
    module federation — `svelte` and `svelte/` singleton shares on both
    sides, see [`webpack.config.js`](webpack.config.js). Svelte keeps its
    reactivity state in module-level variables, so a component compiled
    against a second runtime copy cannot be mounted by the host. The Plone
    bundle shares its runtime since Mockup 5.6.9; on older bundles this
    override fails with `Cannot read properties of null (reading 'nodes')`.

**Scoping the override** (optional): register the component under a custom
key (e.g. `blicca.SelectedItem`) instead, and activate it via the pattern
option `componentRegistryKeys.selectedItem` — site-wide through the registry
record `plone.patternoptions` (technique 1 again, closing the circle; see the
commented example in
[`profiles/default/registry/patternoptions.xml`](src/blicca/staticresourceoverride/profiles/default/registry/patternoptions.xml)),
per widget via `data-pat-contentbrowser`, or conditionally via an
`IPatternsSettings` adapter (see `Products.CMFPlone.patterns.settings` as a
template). The default component stays registered for every widget without
the option.

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

The package manager is **pnpm** (like mockup itself; version pinned via the
`packageManager` field — `corepack enable` gets you the right one).

```bash
cd src/blicca.staticresourceoverride
pnpm install
pnpm run build # → src/blicca/staticresourceoverride/static/bundles/
```

For development: `pnpm run watch` (rebuilds on change; in Plone a browser
reload is enough then, as long as `plone.resources.development` is enabled
or the resource cache is bypassed).

[`pnpm-workspace.yaml`](pnpm-workspace.yaml) mirrors the known caveats of
[plone/mockup](https://github.com/plone/mockup): `shamefullyHoist: true`
(webpack needs a flat `node_modules`), removal of the git subdependencies
`slick-carousel`/`slides`/`select2` (pnpm blocks exotic subdependencies),
and an `allowBuilds` allowlist for dependency build scripts.

**Important:** The versions of `@plone/mockup` and
`@patternslib/patternslib` in [`package.json`](package.json) should match
the Mockup version shipped with `plone.staticresources` — module federation
negotiates shared modules via version ranges. So keep them in sync on Plone
upgrades and rebuild.

### Install in Plone

No Plone site yet? Install the [prerequisites from the Plone
documentation](https://6.docs.plone.org/install/create-project-cookieplone.html#prerequisites-for-installation)
(uv, Make, git) and generate a project with `uvx cookieplone project`.
Cookieplone 2.0 has no separate Blicca template any more — answer the
question _Use Volto as frontend?_ with **No** to get a Blicca project.

In a Cookieplone project, add the package as a source checkout to
`backend/mx.ini`, pin `plone.staticresources` to a release with Mockup
5.6.14 or later, add `"blicca.staticresourceoverride"` to the
`dependencies` in `backend/pyproject.toml`, and re-run `make install`
(mxdev clones it into `backend/sources/` and registers it as an editable
`tool.uv.sources` entry):

```ini
[settings]
main-package = -e .[test]
version-overrides =
    plone.staticresources==3.0.9

[blicca.staticresourceoverride]
url = https://github.com/collective/blicca.staticresourceoverride.git
branch = main
```

In any other setup, a plain editable install works as well:

```bash
pip install -e blicca.staticresourceoverride # into your project's virtualenv
```

Then restart the instance and install the add-on **"Blicca Static Resource
Override (Training)"** in the add-ons control panel (or via `portal_setup`).

### Checklist for the live demo

1. External links open in a new window (technique 1, no JS involved).
2. Paragraph with class `pat-blicca` → badge + outline (technique 2).
3. External links show the new icon (technique 3 + blacklist).
4. Open the content browser on a relation/image field, select items →
   the selection renders with the Blicca `SelectedItem` component
   (technique 4, activated via technique 1).
5. Browser console: `Patternslib Module Federation: Loaded and initialized
bundle "__patternslib_mf__bliccastaticresourceoverride"` confirms that
   the host has loaded the remote.

## Known pitfalls

- **Forgotten build**: `static/bundles/` is empty → 404 for the remote
  bundle. Run `pnpm run build` first, then install.
- **Version drift**: If the add-on's Patternslib version diverges too far
  from the Plone bundle's, module federation loads two instances — then
  registrations end up in the "wrong" registry. Check the console for MF
  warnings.
- Omitting **`purge="false"`** on `plone.patternoptions` overwrites the
  options of the Plone core and other add-ons.
- **Default component wins again** although you registered yours under the
  default key: the Plone bundle is older than Mockup 5.6.11 — register under
  a custom key and activate it via `componentRegistryKeys` instead.
- With a custom key, the component registration is _lazy_: the content
  browser falls back to the default component if the key is not registered —
  a typo in the registry key therefore only shows up as "nothing happens".
- **Two Svelte runtimes**: if the selection list renders an empty slot and
  the console shows `Cannot read properties of null (reading 'nodes')`,
  host and add-on don't share the Svelte runtime — either the Plone bundle
  is older than Mockup 5.6.9, or the `svelte`/`svelte/` shares are missing
  in your webpack config.
