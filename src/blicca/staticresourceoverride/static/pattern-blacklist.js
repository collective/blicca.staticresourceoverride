/* Pattern blacklist — part of demo 3 ("replace a core pattern").
 *
 * This file is registered as a standalone, SYNCHRONOUSLY loaded bundle
 * (no webpack, no build needed). It has to run BEFORE the Plone bundle
 * registers its patterns — which is guaranteed because Mockup registers its
 * patterns in an asynchronously loaded chunk, while this script runs the
 * classic synchronous way in the <head>.
 *
 * The Patternslib registry skips the registration of all pattern names
 * listed here. Our replacement pattern registers itself afterwards under
 * its own name with the same trigger
 * (resources/markspeciallinks/markspeciallinks.js).
 */
window.__patternslib_patterns_blacklist = (
    window.__patternslib_patterns_blacklist || []
).concat(["markspeciallinks", "structure"]);
