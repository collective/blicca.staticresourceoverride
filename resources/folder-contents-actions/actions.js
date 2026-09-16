/* Stretch goal: customize the row actions of the folder contents.
 *
 * pat-structure renders the action menu of every row and then scans it with
 * the Patternslib registry. So a pattern with the trigger ".actionmenu"
 * runs for every row, right after the menu was rendered. No blacklist, no
 * copy of the structure app, just a small pattern like in chapter 4.
 */
import { BasePattern } from "@patternslib/patternslib/src/core/basepattern";
import registry from "@patternslib/patternslib/src/core/registry";
import utils from "@plone/mockup/src/core/utils";

class Pattern extends BasePattern {
    static name = "blicca-folder-contents-actions";
    // The menu is scanned while it is still detached from the table, so the
    // trigger must match the menu element itself, not a descendant of
    // ".pat-structure".
    static trigger = ".btn-group.actionmenu";

    async init() {
        // Wait a tick, until the menu is appended to its row.
        await new Promise((resolve) => setTimeout(resolve));
        const row = this.el.closest(".pat-structure tr");
        // pat-structure stores the Backbone model of the item on its row.
        const item = row?.model?.attributes;
        if (!item) {
            return;
        }

        // 1. Open the edit form in a modal.
        const edit = this.el.querySelector("a.editItem");
        if (edit) {
            edit.classList.add("pat-plone-modal");
            registry.scan(edit);
        }

        // 2. Add the cropping editor for images, also in a modal.
        if (item.portal_type === "Image" && edit) {
            const crop = document.createElement("a");
            crop.className = "btn btn-sm action cropItem pat-plone-modal";
            crop.href = `${item.getURL}/@@croppingeditor`;
            crop.title = "Crop image";
            crop.setAttribute("aria-label", "Crop image");
            crop.innerHTML = await utils.resolveIcon("crop");
            edit.after(crop);
            registry.scan(crop);
        }
    }
}

registry.register(Pattern);
export default Pattern;
