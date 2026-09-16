/* Stretch goal: customize the row actions of the folder contents.
 *
 * Same recipe as the markspeciallinks replacement: the blacklist keeps Mockup
 * from registering "structure", we extend the original pattern class and
 * register it under our own name with the original trigger. Because our
 * bundle now ships its own copy of the structure app, we can patch the
 * ActionMenuView of that copy: it builds the per-row menu in initialize().
 *
 * Why not the ``menuOptions`` option? If set, Mockup's menu generator
 * (src/pat/structure/js/actionmenu.js) returns it as-is for every row and
 * skips the per-row logic: no Open/Edit URLs, no Paste/Move/default page
 * filtering.
 */
import $ from "jquery";
import mockupParser from "@patternslib/patternslib/src/core/mockup-parser";
import Structure from "@plone/mockup/src/pat/structure/structure";
import ActionMenuView from "@plone/mockup/src/pat/structure/js/views/actionmenu";
import utils from "@plone/mockup/src/core/utils";

// Mockup resolves menu icons while rendering the row, without awaiting the
// first fetch. Warm the icon cache for our new icon, so that the first row
// already shows it instead of the title text.
utils.resolveIcon("crop");

const original_initialize = ActionMenuView.prototype.initialize;
ActionMenuView.prototype.initialize = function (options) {
    original_initialize.call(this, options);

    // this.menuOptions is the generated menu for THIS row: Paste, Move and
    // "Set as default page" are already filtered, the URLs are resolved.
    const item = this.model.attributes;

    // 1. Open the edit form in a modal. Note: the ``modal: true`` flag of
    //    Mockup's menu entries has no effect (the view appends the modal
    //    class after the class list was built), so we set the css class of
    //    pat-plone-modal ourselves.
    this.menuOptions.editItem.css = "pat-plone-modal";

    // 2. Add the cropping editor of plone.app.imagecropping for images,
    //    also in a modal.
    if (item.portal_type === "Image") {
        this.menuOptions.cropItem = {
            url: `${item.getURL}/@@croppingeditor`,
            title: "Crop image",
            category: "button", // "button": next to Open/Edit; "dropdown": gear menu
            icon: "crop",
            css: "pat-plone-modal",
            modal: false,
        };
    }

    // Re-bind the click handlers, in case entries with a ``method`` were
    // added or removed. Methods must exist in src/pat/structure/js/actions.js
    // (cutClicked, copyClicked, pasteClicked, moveTopClicked, ...).
    this.events = this.generate_events();
    this.delegateEvents();
};

export default Structure.extend({
    name: "blicca-structure",
    trigger: ".pat-structure",
    parser: null,

    async init() {
        // Take over the options of the original (``data-pat-structure``,
        // including the inheritance from the <body>).
        this.options = $.extend(
            true,
            {},
            this.defaults,
            mockupParser.getOptions(this.el, "structure"),
        );
        return this.constructor.__super__.init.call(this);
    },
});
