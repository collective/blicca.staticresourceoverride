---
myst:
    html_meta:
        "description": "Set up a Plone project with Blicca and the blicca.staticresourceoverride training add-on."
        "property=og:description": "Set up a Plone project with Blicca and the blicca.staticresourceoverride training add-on."
        "property=og:title": "Setup"
        "keywords": "Plone, Blicca, Cookieplone, pnpm, installation, training setup"
---

(blicca-setup-label)=

# Setup

In this chapter, we create a Plone project with Blicca, and install the training add-on.
At the end, your browser console proves that your first own bundle is loaded.

## Create a Plone project with Blicca

Follow the official installation documentation to {doc}`create a Classic UI project with Cookieplone <plone:install/create-project-cookieplone>`.
The Plone documentation still uses the former name of Blicca.
In short:

```shell
uvx cookieplone classic_project
cd <project-slug>
make install
make backend-start
```

Your site now runs at `http://localhost:8080` with the login `admin` and password `admin`.

## Add the add-on as a source checkout

Cookieplone projects manage source checkouts with [mxdev](https://github.com/mxstack/mxdev).
Add the training add-on to the {file}`mx.ini` of your project:

```ini
[blicca.staticresourceoverride]
url = https://github.com/collective/blicca.staticresourceoverride.git
branch = main
```

Then run the installation again:

```shell
make install
```

mxdev clones the repository into {file}`sources/blicca.staticresourceoverride`, and installs it as an editable package.

## Build the JavaScript

Build the add-on's JavaScript inside the source checkout:

```shell
cd sources/blicca.staticresourceoverride
pnpm install
pnpm run build
```

Start the backend again with `make backend-start`.
Then install {guilabel}`Blicca Static Resource Override (Training)` in the add-ons control panel.

## The pnpm caveats

The package manager is pnpm, the same as Mockup itself uses.
The file `pnpm-workspace.yaml` mirrors the known caveats of [plone/mockup](https://github.com/plone/mockup):

- `shamefullyHoist: true`, because webpack module resolution needs a flat `node_modules` directory.
- `overrides` that remove the git subdependencies `slick-carousel`, `slides`, and `select2`, because pnpm blocks exotic subdependencies.
  Only patterns that this add-on does not import need them.
- An `allowBuilds` allowlist, because pnpm 10 and later block dependency build scripts by default.

## Success check

Open any page of your site, and open the browser console.
You should see the following message:

```console
Patternslib Module Federation: Loaded and initialized bundle "__patternslib_mf__bliccastaticresourceoverride".
```

The Plone bundle, the host, has found and initialized your add-on bundle, the remote.
Now we can start overriding things.
