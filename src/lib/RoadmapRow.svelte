<script lang="ts">
  import { ROW_START_INDEX, COLUMN_START_INDEX, STATUS_OPTIONS } from './Config.svelte';
  import type { RoadmapItem, RoadmapItemStatus } from '../global';
  import {
    getRoadmapState,
    removeItem,
    addChildItem,
    updateSpreadsheet,
  } from './RoadmapProvider.svelte';
  import { showConfirmDialog } from './ConfirmProvider.svelte';

  import Button from './Button.svelte';
  import CollapseToggle from './CollapseToggle.svelte';
  import Textbox from './Textbox.svelte';
  import Dropdown from './Dropdown.svelte';
  import TimelineBar from './TimelineBar.svelte';

  interface Props {
    item: RoadmapItem;
    toggleVisibility?: (itemId: string, isVisible: boolean) => void;
    rowNum: number;
    level: number;
    computedStatus: RoadmapItemStatus;
    computedDuration: { startPi: string; endPi: string } | null;
    hasChildren: boolean;
    dragEnabled: boolean;
    dragIndex: number | null;
    handleDragStart: Function;
    handleDragOver: Function;
    handleDragEnd: Function;
  }
  let {
    item = $bindable(),
    toggleVisibility,
    rowNum,
    level,
    computedStatus,
    computedDuration,
    hasChildren,
    dragEnabled,
    dragIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  }: Props = $props();

  let roadmap = getRoadmapState();

  const deleteItem = () => {
    showConfirmDialog(
      `Delete ${item.title}?`,
      `Are you sure you want to delete ${item.title}?`,
      (bool: boolean) => {
        if (bool) removeItem(item);
      },
    );
  };
</script>

{#snippet title(item: RoadmapItem, level: number)}
  {#if level < 2}
    <CollapseToggle itemId={item.id} {toggleVisibility} />
  {:else}
    {#if dragEnabled}
      <handle
        draggable="true"
        role="button"
        tabindex="0"
        aria-label="Drag row"
        ondragstart={(event: DragEvent) => handleDragStart(event, rowNum)}
        ondragover={(event: DragEvent) => handleDragOver(event, rowNum)}
        ondragend={(event: DragEvent) => handleDragEnd(event, rowNum)}
        >⣶
      </handle>
    {/if}
    <span>‣</span>
  {/if}
  <Textbox bind:value={item.title} onChange={() => updateSpreadsheet(item)} />
  <span class="link">
    {#if item.url}
      <a href={item.url} target="_blank" rel="noopener noreferrer" title="Open Link"> ↗ </a>
    {/if}
  </span>
  {#if level < 2}
    <div class="button">
      <Button
        size="small"
        onclick={() => addChildItem(item)}
        title="Add Child Item"
        style="positive">+</Button
      >
    </div>
  {/if}
  {#if !hasChildren}
    <div class="button">
      <Button size="small" onclick={deleteItem} title="Delete" style="negative">X</Button>
    </div>
  {/if}
{/snippet}

<!-- Title -->
{#if level <= 1}
  <div
    class="cell title level-{level}"
    class:dragEnabled
    class:dragging={dragIndex === rowNum}
    style="grid-row: {rowNum + ROW_START_INDEX}; grid-column: 1 / 3;"
  >
    {@render title(item, level)}
  </div>
{:else}
  <div
    class="cell title level-{level}"
    class:dragEnabled
    class:dragging={dragIndex === rowNum}
    style="grid-row: {rowNum + ROW_START_INDEX}; grid-column: 1;"
  >
    {@render title(item, level)}
  </div>
  <!-- Owner -->
  <div
    class="cell owner"
    style="grid-row: {rowNum + ROW_START_INDEX}; grid-column: 2;"
    class:dragging={dragIndex === rowNum}
  >
    <Textbox bind:value={item.owner} onChange={() => updateSpreadsheet(item)} />
  </div>
{/if}

<!-- Status -->
<div
  class="cell status {computedStatus} level-{level}"
  class:dragging={dragIndex === rowNum}
  style="grid-row: {rowNum + ROW_START_INDEX}; grid-column: 3;"
>
  {#if level <= 1}
    <span>{STATUS_OPTIONS.filter((item) => item.value === computedStatus)[0]?.label}</span>
  {:else}
    <Dropdown
      bind:value={item.status}
      options={STATUS_OPTIONS}
      onChange={() => updateSpreadsheet(item)}
    />
  {/if}
</div>
<!-- Blank PI cells -->
{#each roadmap.PIs as _, i}
  <div
    class="cell pi-cell level-{level}"
    class:dragging={dragIndex === rowNum}
    style="grid-row: {rowNum + ROW_START_INDEX}; grid-column: {i + COLUMN_START_INDEX};"
  ></div>
{/each}

{#if level <= 1}
  {@const headerItem = {
    ...item,
    status: computedStatus ? computedStatus : item.status,
    startPi: computedDuration ? computedDuration.startPi : item.startPi,
    endPi: computedDuration ? computedDuration.endPi : item.endPi,
  }}
  <TimelineBar item={headerItem} {rowNum} editable={false} />
{:else}
  <!-- ignore warnings about binding to non-reactive property-->
  <TimelineBar bind:item {rowNum} />
{/if}

<style>
  .cell {
    background-color: white;
    color: navy;
    padding-left: 8px;
    display: flex;
    align-items: center;
    justify-content: start;
    gap: 4px;
    position: relative;
    z-index: 1;
  }
  .cell.title {
    font-weight: 500;
  }
  .cell.level-0 {
    background-color: #cad8fb;
  }
  .cell.level-1 {
    background-color: #dfe7fb;
  }
  .cell.title {
    display: grid;
    grid-template-columns: auto auto 1fr auto auto;
    padding-right: 4px;
  }
  .cell.owner {
    color: #333333;
  }
  .cell.level-1.status {
    font-size: unset;
  }
  .cell.status.completed {
    color: green;
  }
  .cell.status.planned {
    color: gray;
  }
  .pi-cell {
    background-color: #f9f9f9;
  }
  .cell.title.level-0 {
    font-size: 1.1rem;
  }
  .cell.title.level-1 {
    font-size: 1rem;
    padding-left: 1rem;
  }
  .cell.title.level-2 {
    padding-left: 1.5rem;
  }
  .cell.title.level-2.dragEnabled {
    padding-left: 0.6rem;
  }
  .cell .button {
    visibility: hidden;
  }
  .cell:hover .button {
    visibility: visible;
  }
  .cell > span.link {
    opacity: 0;
  }
  .cell:hover > span.link {
    opacity: 1;
  }
  .cell > span.link > a {
    font-size: 1rem;
    color: #000000;
    text-decoration: none;
    cursor: pointer;
    padding-left: 8px;
  }
  .cell > handle {
    opacity: 0;
    cursor: grab;
    margin-top: -6px;
  }
  .cell:hover > handle {
    opacity: 1;
  }
  .cell.dragging {
    opacity: 0.5;
  }
  @media (max-width: 1200px) {
    .roadmap {
      font-size: 12px;
    }

    .cell {
      padding: 6px;
    }
  }
</style>
