---
myst:
  html_meta:
    "description": "Replace a Blicca core pattern with your own implementation, using the Patternslib pattern blacklist."
    "property=og:description": "Replace a Blicca core pattern with your own implementation, using the Patternslib pattern blacklist."
    "property=og:title": "Replacing a core pattern"
    "keywords": "Plone, Blicca, Patternslib, blacklist, markspeciallinks, override"
---

(blicca-replace-pattern-label)=

# Replacing a core pattern

Sometimes tweaking options is not enough, and you want your own implementation of a core pattern.
In this chapter, we replace `markspeciallinks`, and external links get a different icon.

## Why load order is not enough

The registry rule from {ref}`blicca-intro-label` applies.
**First registration wins.**
Mockup registers its patterns in an asynchronously loaded chunk, so the exact timing between the host and your remote is not guaranteed.
Racing the host is not a strategy.

Patternslib provides an official switch instead: the pattern blacklist.

## The blacklist preload

The file {file}`static/pattern-blacklist.js` is a tiny, unbuilt JavaScript file:

```js
window.__patternslib_patterns_blacklist = (
    window.__patternslib_patterns_blacklist || []
).concat(["markspeciallinks"]);
```

The profile registers it as its own bundle, without a `depends` value:

```xml
<records
    interface="plone.base.interfaces.IBundleRegistry"
    prefix="plone.bundles/blicca-preload"
    >
  <value key="enabled">True</value>
  <value key="jscompilation">++plone++blicca.staticresourceoverride/pattern-blacklist.js</value>
</records>
```

It renders before the Plone bundle and runs synchronously, while Mockup registers its patterns in an async chunk.
The original pattern therefore never gets registered.

```{note}
Bundles are just files.
This one needs no build at all.
```

## The replacement

The blacklist blocks any registration under the blocked name, including yours.
Therefore, the replacement in {file}`resources/markspeciallinks/markspeciallinks.js` registers under its own name, but with the original trigger:

```js
import $ from "jquery";
import mockupParser from "@patternslib/patternslib/src/core/mockup-parser";
import MarkSpecialLinks from "@plone/mockup/src/pat/markspeciallinks/markspeciallinks";

export default MarkSpecialLinks.extend({
    name: "blicca-markspeciallinks",
    trigger: ".pat-markspeciallinks",
    parser: null,

    async init() {
        this.options = $.extend(
            true,
            {},
            this.defaults,
            mockupParser.getOptions(this.el, "markspeciallinks")
        );
        this.protocol_icon_map = {
            ...this.protocol_icon_map,
            https: "box-arrow-up-right",
            http: "box-arrow-up-right",
        };
        return this.constructor.__super__.init.call(this);
    },
});
```

Note the three tricks:

-   We extend the original class, and reuse its whole implementation.
-   We register under the name `blicca-markspeciallinks`, with the original trigger `.pat-markspeciallinks`.
-   The Mockup parser reads options based on the pattern name, and our name differs.
    Therefore, `init()` fetches the original's options itself with `mockupParser.getOptions()`, including the inheritance from the `<body>`.

## Exercise

Change the icon that external links get.
Pick any name from [Bootstrap Icons](https://icons.getbootstrap.com/).
As a bonus, additionally set `rel="noopener noreferrer"` on external links.

## Checkpoint

External links show your icon.
The console confirms that the original was skipped:

```console
registry: Pattern name markspeciallinks is blacklisted.
```
