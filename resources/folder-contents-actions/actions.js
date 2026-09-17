/* Stretch goal: customize the row actions of the folder contents.
 *
 * pat-structure scans every rendered row with the Patternslib registry
 * (since Mockup 5.6.14 the attached row, before that the detached menu).
 * So a pattern with a trigger matching the action menu runs for every row,
 * right after it was rendered. No blacklist, no copy of the structure app,
 * just a small pattern like in chapter 4.
 */
import { BasePattern } from "@patternslib/patternslib/src/core/basepattern";
import registry from "@patternslib/patternslib/src/core/registry";
import utils from "@plone/mockup/src/core/utils";

class Pattern extends BasePattern {
    static name = "blicca-folder-contents-actions";
    // Match the menu element itself: before Mockup 5.6.14 the menu was
    // scanned while still detached from the table, so a descendant selector
    // of ".pat-structure" would not match there.
    static trigger = ".btn-group.actionmenu";

    async init() {
        // Wait a tick, so that the menu is appended to its row on Mockup
        // versions that scan the menu before attaching it.
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
