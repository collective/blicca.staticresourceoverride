<script>
    /* Blicca variant of the pat-contentbrowser "SelectedItem" component.
     *
     * The only thing that matters is the props interface — it has to match
     * the original component (mockup:
     * src/pat/contentbrowser/src/SelectedItem.svelte):
     *
     *   - item:         the selected object (catalog metadata)
     *   - unselectItem: callback to remove it from the selection
     */
    let { item, unselectItem } = $props();
</script>

<div
    class="blicca-selected-item border border-primary rounded mb-1 p-2 bg-primary-subtle"
    data-uuid={item.UID}
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
    .blicca-selected-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: move;
    }
    .blicca-selected-item__info {
        flex: 1 1 auto;
    }
    .blicca-selected-item img {
        object-fit: cover;
        width: 32px;
        height: 32px;
        border-radius: 0.25rem;
    }
</style>
