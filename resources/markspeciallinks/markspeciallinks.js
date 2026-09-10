/* Replacement for the core pattern "markspeciallinks".
 *
 * How the pieces play together (see also static/pattern-blacklist.js):
 *
 * 1. The blacklist prevents Mockup from registering the original under the
 *    name "markspeciallinks" ("first registration wins" — and the blacklist
 *    would block our name just the same, which is why we register as
 *    "blicca-markspeciallinks").
 * 2. We extend the original class (code reuse!) and register it under our
 *    own name, but with the ORIGINAL trigger ".pat-markspeciallinks" — so
 *    our replacement kicks in everywhere the original used to run.
 * 3. Since the Patternslib mockup parser reads the options based on the
 *    pattern NAME from ``data-pat-markspeciallinks``, but our name differs,
 *    we read the original's options ourselves in init() (including
 *    inheritance from the <body>, where Plone puts them via the
 *    IPatternsSettings adapter).
 */
import $ from "jquery";
import mockupParser from "@patternslib/patternslib/src/core/mockup-parser";
import MarkSpecialLinks from "@plone/mockup/src/pat/markspeciallinks/markspeciallinks";

export default MarkSpecialLinks.extend({
    name: "blicca-markspeciallinks",
    trigger: ".pat-markspeciallinks",
    // We parse ourselves (see init), not via the pattern name.
    parser: null,

    async init() {
        // Take over the options of the original pattern.
        this.options = $.extend(
            true,
            {},
            this.defaults,
            mockupParser.getOptions(this.el, "markspeciallinks"),
        );

        // Our customization: external http(s) links get a different, more
        // obvious icon than the original ("box-arrow-up-right" instead of
        // "link-45deg").
        this.protocol_icon_map = {
            ...this.protocol_icon_map,
            https: "box-arrow-up-right",
            http: "box-arrow-up-right",
        };

        // The original does the rest.
        return this.constructor.__super__.init.call(this);
    },
});
