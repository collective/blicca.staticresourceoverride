/* Blicca Static Resource Override — training demos.
 *
 * This module is loaded as a module federation remote by the Plone bundle
 * (Mockup). All core modules imported here (Patternslib registry,
 * @plone/registry) are "shared dependencies" — so we are working with the
 * very same registry instances as the Plone bundle itself.
 *
 * (Step 1 of the training — pattern options via plone.patternoptions —
 * needs no JavaScript at all, see
 * profiles/default/registry/patternoptions.xml.)
 */
import registry from "@patternslib/patternslib/src/core/registry";

// ---------------------------------------------------------------------------
// Step 2 — Register your own, new pattern.
//
// A class-based pattern in the current Patternslib style. After
// registration, the registry automatically scans the document (also after
// AJAX injections) for the trigger selector.
import "./pat-blicca/blicca";

// ---------------------------------------------------------------------------
// Step 3 — Replace a core pattern entirely.
//
// Works in tandem with the pattern blacklist
// (static/pattern-blacklist.js), which prevents the original from being
// registered. Our replacement registers itself under its own name, but with
// the same trigger.
import "./markspeciallinks/markspeciallinks";

// ---------------------------------------------------------------------------
// The registry is usually already initialized by the Plone bundle — in that
// case this call is a no-op (newly registered patterns trigger a targeted
// re-scan anyway). But it does no harm and makes the bundle work standalone
// as well (demo page, tests).
registry.init();
