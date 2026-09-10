---
myst:
  html_meta:
    "description": "Notes for trainers: schedule, timing, and fallback strategies for the Blicca customization training."
    "property=og:description": "Notes for trainers: schedule, timing, and fallback strategies for the Blicca customization training."
    "property=og:title": "Notes for trainers"
    "keywords": "Plone, Blicca, training, trainer notes, schedule"
---

(blicca-trainer-notes-label)=

# Notes for trainers

This chapter addresses trainers who give this training on site.
The training is designed for half a day, or 240 minutes including one break.

## Schedule

| Time      | Block                                          | Minutes |
| --------- | ---------------------------------------------- | ------- |
| 0:00–0:20 | {ref}`blicca-intro-label`                      | 20      |
| 0:20–0:50 | {ref}`blicca-setup-label`                      | 30      |
| 0:50–1:20 | {ref}`blicca-pattern-options-label`            | 30      |
| 1:20–1:50 | {ref}`blicca-own-pattern-label`                | 30      |
| 1:50–2:05 | Break                                          | 15      |
| 2:05–2:50 | {ref}`blicca-replace-pattern-label`            | 45      |
| 2:50–3:40 | {ref}`blicca-svelte-override-label`            | 50      |
| 3:40–4:00 | {ref}`blicca-production-label`, questions      | 20      |

## Before the training

Send participants the repository link, the setup instructions, and the version requirements at least one week ahead.
Ask them to run the setup beforehand, including one `pnpm install`, to warm their package caches.

## Timing advice

The setup block is deliberately generous.
Losing ten minutes there saves thirty minutes later.
Pair up stragglers, and keep a prepared project as a fallback for environment disasters.

The chapters on replacing a core pattern and on the Svelte override carry the most new material.
If you need time, steal it from the pattern options chapter, and never from the setup.

## Fallback tags

After every block, announce the matching git tag.
Anyone who got stuck checks out the tag, and continues with the group:

```shell
git checkout step-2
pnpm install && pnpm run build
```

## Wifi disaster plan

Bring a warm pnpm store, or `node_modules` as a tarball on USB sticks.
Find your local store path with `pnpm store path`.
Installing packages is the only step that needs the network.

## Live demo checklist

Use this list for the final wrap-up, or whenever you need to prove that everything works:

1.  External links open in a new window, with no JavaScript involved.
2.  A paragraph with the class `pat-blicca` renders the badge and the outline.
3.  External links show the replaced icon.
4.  The content browser selection renders with the custom `SelectedItem` component.
5.  The browser console shows the module federation message for the add-on bundle.
