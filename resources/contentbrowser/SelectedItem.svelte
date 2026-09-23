<script>
    /* Blicca variant of the pat-contentbrowser "SelectedItem" component.
     *
     * The only thing that matters is the props interface — it has to match
     * the original component (mockup:
     * src/pat/contentbrowser/src/SelectedItem.svelte):
     *
     *   - item:         the selected object (catalog metadata)
     *   - unselectItem: callback to remove it from the selection
     *
     * The root element must carry the "selected-item" class: SelectedItems
     * reads the sort order from `.selected-item[data-uuid]` after a drag.
     */
    let { item, unselectItem } = $props();

    // The component is mounted without the content browser's context, so
    // the config is not available via getContext(). Read the
    // maximumSelectionSize from the pattern instance on the hidden input
    // instead (the content browser is inserted right before it). A single
    // select (e.g. the TinyMCE image dialog) passes this option via JS, so
    // it cannot be detected with CSS alone.
    let multiSelect = $state(false);

    function detectMultiSelect(node) {
        const input = node.closest(".content-browser-wrapper")?.nextElementSibling;
        const options = input?.["pattern-contentbrowser"]?.options;
        // no maximumSelectionSize (e.g. the relatedItems field) = unlimited
        multiSelect = !!options && Number(options.maximumSelectionSize) !== 1;
    }
</script>

<div
    class="selected-item blicca-selected-item border border-primary rounded p-2 bg-primary-subtle"
    class:blicca-selected-item--multi={multiSelect}
    data-uuid={item.UID}
    use:detectMultiSelect
>
    {#if item.getURL && (item.getIcon || item.portal_type === "Image")}
        <img src="{item.getURL}/@@images/image/icon" alt={item.Title} />
    {/if}
    <div class="blicca-selected-item__info">
        <strong>{item.Title}</strong>
        <span class="badge text-bg-primary">{item.portal_type}</span>
        {#if item.review_state}
            <span class="badge text-bg-light state-{item.review_state}"
                >{item.review_state}</span
            >
        {/if}
        <br />
        <small class="text-body-secondary">{item.path}</small>
    </div>
    <button
        class="btn btn-sm btn-outline-danger"
        type="button"
        aria-label="remove"
        title="Remove"
        onclick={(e) => {
            e.preventDefault();
            unselectItem(item.UID);
        }}>✕</button
    >
</div>

<style>
    /* SelectedItems mounts each item into its own wrapper <div>, so the
     * column layout has to live on the shared container. :has() limits it
     * to content browsers that use this component: one full-width column
     * for a single select, three columns for a multi select. */
    :global(.content-browser-selected-items:has(.blicca-selected-item)) {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 0.5rem;
        padding-bottom: 0.5rem;
    }
    /* Responsive to the container width (also works in modals): a column is
     * at least 12rem wide, but never narrower than a third of the row
     * (minus the two gaps) — so at most 3 columns, fewer when narrow. */
    :global(.content-browser-selected-items:has(.blicca-selected-item--multi)) {
        grid-template-columns: repeat(
            auto-fill,
            minmax(min(100%, max(12rem, calc((100% - 1rem) / 3))), 1fr)
        );
    }
    /* "maximum reached" / "loading" hints span the full width */
    :global(.content-browser-selected-items:has(.blicca-selected-item) > p) {
        grid-column: 1 / -1;
    }
    .blicca-selected-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        height: 100%;
    }
    /* only a multi select is sortable */
    .blicca-selected-item--multi {
        cursor: move;
    }
    .blicca-selected-item__info {
        flex: 1 1 auto;
        min-width: 0;
        overflow-wrap: anywhere;
    }
    .blicca-selected-item img {
        object-fit: cover;
        width: 32px;
        height: 32px;
        border-radius: 0.25rem;
    }
</style>
