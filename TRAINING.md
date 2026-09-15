# Half-Day Training: Overriding Blicca — Patterns & Svelte Components in Plone

A 4-hour hands-on training on Blicca (formerly known as Classic UI), Plone's
server-rendered frontend. Participants build their own
`<name>.staticresourceoverride` add-on step by step, with this repository as
the reference implementation and safety net.

**Format:** half day (4 hours including one break)
**Level:** beginner/intermediate
**Audience:** integrators and developers with basic Plone experience

## Learning objectives

After this training, participants can:

1. Configure patterns site-wide via the `plone.patternoptions` registry
   record — without writing any JavaScript.
2. Build and register their own Patternslib pattern and ship it as a module
   federation remote bundle.
3. Replace a core pattern using the pattern blacklist while reusing the
   original implementation and its options.
4. Override a Svelte component (content browser `SelectedItem`) via the
   shared `@plone/registry`.
5. Explain how the Blicca JS stack loads, registers and shares code — and
   debug it when it doesn't.

## Prerequisites

Participants need:

- Basic Plone knowledge (installing add-ons, GenericSetup profiles).
- JavaScript basics: ES6+ syntax, module imports. No Svelte experience
  required.
- A laptop with the [prerequisites from the Plone
  documentation](https://6.docs.plone.org/install/create-project-cookieplone.html#prerequisites-for-installation)
  (uv, Make, git), plus Node ≥ 22 and **pnpm** (`corepack enable` is all it
  takes — the version is pinned in `package.json`), and a code editor.

**Send this to participants at least one week before the training:**

- Link to this repository.
- Setup instructions (below) with the request to run them beforehand —
  ideally including one `pnpm install` to warm the pnpm store on
  conference wifi.
- The version requirements above.

## Setup (Block 0 in the schedule)

**1. A Plone project with Blicca** — Cookieplone 2.0 has no separate
Blicca template any more. Generate a project with the `project` template
and answer question 10, _Use Volto as frontend?_, with **No**:

```bash
uvx cookieplone project
cd <project-slug>
make install         # uv virtualenv + Plone site "Plone"
make backend-start   # → http://localhost:8080/Plone (admin/admin)
```

Sensible answers for the training: Plone version 6.2.2 or later, and No
for the caching server, Ansible, the GitHub deploy action and the
documentation scaffold.

**2. This add-on** — the backend lives in `backend/`. Cookieplone projects
manage source checkouts with [mxdev](https://github.com/mxstack/mxdev).
Add the add-on to `backend/mx.ini`, and pin `plone.staticresources` to a
release with Mockup 5.6.11 or later in the same file (Plone 6.2.2 ships
3.0.6 with Mockup 5.6.10, enough for blocks 1–3, but block 4 needs 5.6.11):

```ini
[settings]
main-package = -e .[test]
version-overrides =
    plone.staticresources==3.0.7

[blicca.staticresourceoverride]
url = https://github.com/collective/blicca.staticresourceoverride.git
branch = main
```

Add `"blicca.staticresourceoverride"` to the `dependencies` in
`backend/pyproject.toml`, then re-run `make install` — mxdev clones the
repository into `backend/sources/blicca.staticresourceoverride`, registers
it as an editable `tool.uv.sources` entry, and uv installs it. Then build
the JavaScript inside the checkout:

```bash
cd backend/sources/blicca.staticresourceoverride
pnpm install
pnpm run build
```

Start the backend again and install **"Blicca Static Resource Override
(Training)"** in the add-ons control panel.

**Success check:** the browser console on any page shows

```
Patternslib Module Federation: Loaded and initialized bundle "__patternslib_mf__bliccastaticresourceoverride"
```

## How to use the step tags

The git history of this repository mirrors the four training steps. Each tag
is a **working state** of the add-on after the corresponding block:

| Tag      | State after…                                                |
| -------- | ----------------------------------------------------------- |
| `step-1` | Pattern options via registry only — no JavaScript build yet |
| `step-2` | Own pattern `pat-blicca` + webpack/module federation setup  |
| `step-3` | Core pattern `markspeciallinks` replaced via blacklist      |
| `step-4` | Svelte `SelectedItem` override — identical to `main`        |

If you fall behind, jump to the current step and continue from there:

```bash
git checkout step-2        # detached HEAD is fine for the training
pnpm install && pnpm run build
```

Re-import the add-on profile (or reinstall the add-on) after switching
steps, so new registry records are applied.

## Schedule (240 minutes)

| Time      | Block                                   | Minutes |
| --------- | --------------------------------------- | ------- |
| 0:00–0:20 | Big picture: the Blicca JS stack        | 20      |
| 0:20–0:50 | Block 0 — Setup                         | 30      |
| 0:50–1:20 | Block 1 — Overrides without JavaScript  | 30      |
| 1:20–1:50 | Block 2 — Your own pattern              | 30      |
| 1:50–2:05 | ☕ Break                                | 15      |
| 2:05–2:50 | Block 3 — Replacing a core pattern      | 45      |
| 2:50–3:40 | Block 4 — Overriding a Svelte component | 50      |
| 3:40–4:00 | Production notes, Q&A, where to go next | 20      |

---

### Big picture (20 min, talk + diagram)

No slides marathon — one architecture diagram and a browser dev-tools tour:

- Mockup is the JS package behind the `plone` bundle; patterns register in
  the **Patternslib registry** and initialize via their **trigger** (a CSS
  selector). Rule: **first registration wins**.
- The Plone bundle is a **module federation host**; add-on bundles are
  remotes, initialized on document-ready, **sharing** core modules
  (Patternslib, `@plone/registry`, jQuery, Bootstrap).
- Newer patterns like `pat-contentbrowser` are **Svelte apps** that pull
  sub-components from the `@plone/registry` component registry.
- Show it live: `document.body` attributes (`data-pat-*`), the network tab
  (bundle → chunks), the console (MF messages).

### Block 0 — Setup (30 min)

Everyone reaches the success check above.
This block is deliberately generous — losing 10
minutes here saves 30 later.

### Block 1 — Overrides without JavaScript (30 min)

**Concepts:** resource registry & bundle anatomy, `plone.patternoptions`
(dict record → `data-pat-*` on `<body>` → options inheritance).

**Walkthrough:** change `plone.patternoptions` **through the web** first
(Site Setup → Configuration Registry) — instant win, then persist it in the
GS profile:
[`profiles/default/registry/patternoptions.xml`](src/blicca/staticresourceoverride/profiles/default/registry/patternoptions.xml)

**Exercise:** make external links open in a new window via the
`markspeciallinks` entry. Verify the `data-pat-markspeciallinks` attribute
on `<body>` in dev tools.

**Teaching points:**

- `purge="false"` — don't wipe other packages' entries.
- Precedence: `plone.patternoptions` entries override what Plone's
  `IPatternsSettings` adapters render for the same pattern (e.g. the link
  settings from the control panel). Powerful, but be deliberate.
- Options alone don't run a pattern — the **trigger class** must be there.
  For `pat-markspeciallinks` the `<body>` class only renders when one of
  Plone's link settings is enabled; that's why the profile also sets
  `plone.mark_special_links` (see `linksettings.xml`). Good habit: when a
  pattern "does nothing", first check trigger, then options.

**Checkpoint:** external links open in a new tab; no build was run.

### Block 2 — Your own pattern (30 min)

**Concepts:** class-based patterns (`BasePattern`, `Parser`,
`registry.register`), the build pipeline (webpack via `@patternslib/dev`,
module federation remote), the bundle records in
[`bundles.xml`](src/blicca/staticresourceoverride/profiles/default/registry/bundles.xml).

**Walkthrough:** dissect
[`resources/pat-blicca/blicca.js`](resources/pat-blicca/blicca.js) and the
entry points [`index.js`](resources/index.js) /
[`overrides.js`](resources/overrides.js). Start `pnpm run watch`. Point out
[`pnpm-workspace.yaml`](pnpm-workspace.yaml): it carries the known caveats
of [plone/mockup](https://github.com/plone/mockup) (`shamefullyHoist` for
webpack, removed git subdependencies, `allowBuilds`).

**Exercise:** give a paragraph the class `pat-blicca` in TinyMCE and reload.
Then add your own option (e.g. change the badge text via
`data-pat-blicca="label: Hello PloneConf"`), tweak the styling.

**Checkpoint:** badge + outline appear on the paragraph; changing
`data-pat-blicca` options changes the result.

### Block 3 — Replacing a core pattern (45 min)

**Concepts:** why load order alone is not reliable → the pattern blacklist
(`window.__patternslib_patterns_blacklist`); registering a replacement under
an **own name** with the **original trigger**; bridging the original's
options with `mockupParser.getOptions()`.

**Walkthrough:** the three pieces —
[`static/pattern-blacklist.js`](src/blicca/staticresourceoverride/static/pattern-blacklist.js)
(unbuilt, synchronous preload bundle),
[`resources/markspeciallinks/markspeciallinks.js`](resources/markspeciallinks/markspeciallinks.js)
(extends the original class), and the `blicca-preload` record in
`bundles.xml`.

**Exercise:** change the icon external links get (icon names: see
Bootstrap Icons), or additionally set `rel="noopener noreferrer"`.

**Teaching points:**

- The blacklist blocks _any_ registration under that name — including
  yours. Hence the own name + original trigger combo.
- The preload bundle needs no build at all — bundles are just files.

**Checkpoint:** external links show the new icon; the console shows the
original pattern being skipped.

### Block 4 — Overriding a Svelte component (50 min)

**Concepts:** the content browser as a Svelte app; the `@plone/registry`
component registry as the shared extension point; the default key
`pat-contentbrowser.SelectedItem` for a site-wide override without any
configuration (Mockup 5.6.11 or later); a custom key plus
`componentRegistryKeys.selectedItem` for a scoped override (set globally via
`plone.patternoptions` — closing the circle to Block 1).

**Walkthrough:**
[`resources/contentbrowser/SelectedItem.svelte`](resources/contentbrowser/SelectedItem.svelte)
(props interface must match the original!), the `registerComponent` call
under the default key in [`overrides.js`](resources/overrides.js). Show in
Mockup's `contentbrowser.js` why this works: the pattern registers its own
default component only if the key is still empty.

**Exercise:** restyle the component — show the review state with workflow
colors, bigger thumbnails, or a compact table row. Open a relation/image
field, select items, watch your component render. Then scope it: register
under a custom key, activate it in `plone.patternoptions` (commented example
in `patternoptions.xml`), rebuild — and switch it off again through the web
(Configuration Registry) without a rebuild.

**Teaching points:**

- The lookup happens once per widget, when its selection list mounts: first
  the custom key from the options, then the default key.
- Before Mockup 5.6.11 the pattern re-registered its default component on
  every widget initialization, and `@plone/registry` overwrites silently —
  an add-on registration under the default key was reset, the custom key
  was the only hook. Nice "why did this need a core fix" story:
  [plone/mockup#1637](https://github.com/plone/mockup/pull/1637).
- The custom key is _lazy_: on a wrong key the content browser silently
  falls back to the default component — check for typos first.
- Svelte knowledge required: template syntax and `$props()` — that's it for
  this exercise.
- **One Svelte runtime**: host and add-on share the runtime via module
  federation (`svelte` + `svelte/` singleton shares in both webpack
  configs). Svelte keeps its reactivity state in module-level variables,
  so two runtime copies can't cooperate. Live-debugging demo if time
  permits: drop the shares from `webpack.config.js`, rebuild, and watch
  the selection list render an empty slot with `Cannot read properties of
null (reading 'nodes')`. Requires a Plone bundle built from Mockup 5.6.9
  or later.

**Checkpoint:** the content browser selection renders with the custom
component.

### Production notes, Q&A (20 min)

- Version pinning: `@plone/mockup` / `@patternslib/patternslib` should match
  the versions shipped by `plone.staticresources` — recheck on every Plone
  upgrade, then rebuild.
- Clean uninstall: bundle records via `remove="true"`, dict entries in
  `plone.patternoptions` need a `post_uninstall` handler (see
  [`setuphandlers.py`](src/blicca/staticresourceoverride/setuphandlers.py)).
- The pitfalls list in the [README](README.md#known-pitfalls).
- Where to go next: Patternslib docs, Mockup source as a pattern cookbook,
  `plone.staticresources` for how the core bundle is built.

## Stretch goals (for fast participants)

- Write an `IPatternsSettings` adapter that sets pattern options
  conditionally (e.g. only on certain content types) — see
  `Products.CMFPlone.patterns.settings` as a template.
- Build a second pattern from scratch (e.g. wrap an external JS library).
- Experiment with bundle ordering via the `depends` field.
- Add a second component registry key and switch components per field via
  widget-level `data-pat-contentbrowser`.

## Trainer notes

- **Fallback tags:** after every block, announce the tag
  (`git checkout step-N`) for anyone who got stuck.
- **Wifi disaster plan:** bring a warm pnpm store (`pnpm store path`) or
  `node_modules` as a tarball on USB sticks; `pnpm install` is the only
  step that needs the network.
- **Timing:** Blocks 3 and 4 carry the most new material — steal time from
  Block 1 if needed, never from Block 0.
- **Live-demo checklist** for the final wrap-up: see
  [README](README.md#checklist-for-the-live-demo).
