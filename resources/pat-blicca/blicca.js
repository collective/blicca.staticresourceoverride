/* pat-blicca — demo for your own, new pattern.
 *
 * Activation in markup:
 *
 *   <p class="pat-blicca">Hello conference!</p>
 *   <p class="pat-blicca" data-pat-blicca="color: #d63384">With option.</p>
 *
 * The trigger is an arbitrary CSS selector — for a quick demo in the
 * training you can e.g. add ``.documentFirstHeading``, then the pattern is
 * visible on every page without any content changes.
 */
import { BasePattern } from "@patternslib/patternslib/src/core/basepattern";
import Parser from "@patternslib/patternslib/src/core/parser";
import registry from "@patternslib/patternslib/src/core/registry";

export const parser = new Parser("blicca");
parser.addArgument("color", "#0083be");
parser.addArgument("label", "Blicca override active");

class Pattern extends BasePattern {
    static name = "blicca";
    static trigger = ".pat-blicca";
    static parser = parser;

    init() {
        const badge = document.createElement("span");
        badge.textContent = `★ ${this.options.label}`;
        badge.setAttribute(
            "style",
            `display: inline-block;
             margin-inline-start: 0.5em;
             padding: 0.1em 0.5em;
             border-radius: 0.5em;
             font-size: 0.6em;
             vertical-align: middle;
             color: white;
             background-color: ${this.options.color};`
        );
        this.el.style.outline = `2px dashed ${this.options.color}`;
        this.el.style.outlineOffset = "0.2em";
        this.el.append(badge);
    }
}

registry.register(Pattern);
export default Pattern;
export { Pattern };
