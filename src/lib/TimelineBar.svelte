<script lang="ts">
  import type { RoadmapItem } from '../global';
  import { ROW_START_INDEX, COLUMN_START_INDEX } from './Config.svelte';

  interface Props {
    PIs: string[];
    allItems: RoadmapItem[];
    item: RoadmapItem;
    rowNum: number;
    onChange?: Function;
    editable?: boolean;
  }
  let {
    PIs,
    allItems = $bindable(),
    item = $bindable(),
    rowNum,
    onChange,
    editable = true,
  }: Props = $props();

  // Function to get grid column span for a timeline bar
  function getColumnSpan(startPi: string, endPi: string): { start: number; end: number } {
    const startIndex = PIs.indexOf(startPi);
    const endIndex = PIs.indexOf(endPi);

    return {
      start: startIndex >= 0 ? startIndex + COLUMN_START_INDEX : COLUMN_START_INDEX, // +3 to account for title, owner columns
      end: endIndex >= 0 ? endIndex + COLUMN_START_INDEX + 1 : COLUMN_START_INDEX + PIs.length, // +4 to span to end of that column
    };
  }
  function updateRelated(item: RoadmapItem) {
    console.log('updateRelated running for', item.title, item.startPi, item.endPi);
    // dependencies = items on which the specified item depends (aka in the items dependencies list)
    const dependencies = allItems.filter(
      (allItem) => item.dependencies && item.dependencies.indexOf(allItem.id) >= 0,
    );
    // dependees = items that have the specified item in their dependencies list
    const dependees = allItems.filter(
      (allItem) => allItem.dependencies && allItem.dependencies?.indexOf(item.id) >= 0,
    );

    // check if any dependents end after or on the updated item's startPi
    // if so, don't allow the item's start to move any further earlier
    dependencies.forEach((dependent) => {
      console.log('Dependent', dependent.title, dependent.startPi, dependent.endPi);
      if (PIs.indexOf(dependent.endPi) >= PIs.indexOf(item.startPi)) {
        console.log('Fixing dependent problem');
        const duration = PIs.indexOf(item.endPi) - PIs.indexOf(item.startPi);
        item.startPi = PIs[PIs.indexOf(dependent.endPi) + 1];
        item.endPi = PIs[PIs.indexOf(item.startPi) + duration];
      }
    });
    // check if any dependees end after the item starts
    // if so, push the item farther into the future
    dependees.forEach((dependee) => {
      console.log('Dependee', dependee.title, dependee.startPi, dependee.endPi);
      if (item.endPi >= dependee.startPi) {
        console.log('Fixing Dependee problem');
        const duration = PIs.indexOf(dependee.endPi) - PIs.indexOf(dependee.startPi);
        dependee.startPi = PIs[PIs.indexOf(item.endPi) + 1];
        dependee.endPi = PIs[PIs.indexOf(dependee.startPi) + duration];
      }
    });
  }

  // Drag state
  let draggedItem = $state<string | null>(null);
  let dragStartX = $state(0);
  let initialStartPiIndex = $state(0);
  let initialEndPiIndex = $state(0);
  let dragMode = $state<'move' | 'resize-start' | 'resize-end' | null>(null);

  function startDrag(
    e: MouseEvent,
    itemId: string,
    mode: 'move' | 'resize-start' | 'resize-end',
  ) {
    if (e.button !== 0) return; // Only left click

    draggedItem = itemId;
    dragMode = mode;
    dragStartX = e.clientX;
    initialStartPiIndex = PIs.indexOf(item.startPi);
    initialEndPiIndex = PIs.indexOf(item.endPi);

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);

    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrag(e: MouseEvent) {
    if (draggedItem === null || !dragMode) return;

    const deltaX = e.clientX - dragStartX;
    const gridElement = document.querySelector('.roadmap') as HTMLElement;
    if (!gridElement) return;

    // Get the actual PI column width
    const piCells = gridElement.querySelectorAll('.header.pi');
    if (piCells.length === 0) return;

    const columnWidth = (piCells[0] as HTMLElement).offsetWidth;
    const columnsShifted = Math.round(deltaX / columnWidth);

    if (columnsShifted === 0) return;

    if (dragMode === 'move') {
      // Move the entire bar
      const duration = initialEndPiIndex - initialStartPiIndex;
      const newStartIdx = Math.max(
        0,
        Math.min(PIs.length - duration - 1, initialStartPiIndex + columnsShifted),
      );
      const newEndIdx = newStartIdx + duration;

      // Update the item's PIs
      if (item.startPi !== PIs[newStartIdx] || item.endPi !== PIs[newEndIdx]) {
        item.startPi = PIs[newStartIdx];
        item.endPi = PIs[newEndIdx];
        updateRelated(item);
        onChange && onChange();
      }
    } else if (dragMode === 'resize-start') {
      // Resize from the start
      const newStartIdx = Math.max(
        0,
        Math.min(initialEndPiIndex, initialStartPiIndex + columnsShifted),
      );
      if (item.startPi !== PIs[newStartIdx]) {
        item.startPi = PIs[newStartIdx];
        updateRelated(item);
        onChange && onChange();
      }
    } else if (dragMode === 'resize-end') {
      // Resize from the end
      const newEndIdx = Math.max(
        initialStartPiIndex,
        Math.min(PIs.length - 1, initialEndPiIndex + columnsShifted),
      );
      if (item.endPi !== PIs[newEndIdx]) {
        item.endPi = PIs[newEndIdx];
        updateRelated(item);

        onChange && onChange();
      }
    }
  }

  function stopDrag() {
    draggedItem = null;
    dragMode = null;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
  }
</script>

<div
  class="timeline-bar status-{item.status} editable-{editable}"
  class:dragging={draggedItem === item.id}
  role="button"
  tabindex="0"
  onmousedown={(e) => startDrag(e, item.id, 'move')}
  style="grid-row: {rowNum + ROW_START_INDEX}; grid-column: {getColumnSpan(
    item.startPi,
    item.endPi,
  ).start} / {getColumnSpan(item.startPi, item.endPi).end};"
  data-item-id={item.id}
>
  <div
    class="resize-handle resize-handle-start"
    onmousedown={(e) => startDrag(e, item.id, 'resize-start')}
    role="button"
    tabindex="0"
    aria-label="Resize start"
  ></div>
  <div class="timeline-label">
    {item.startPi} → {item.endPi}
  </div>
  <div
    class="resize-handle resize-handle-end"
    onmousedown={(e) => startDrag(e, item.id, 'resize-end')}
    role="button"
    tabindex="0"
    aria-label="Resize end"
  ></div>
</div>

<style>
  .timeline-bar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: white;
    font-weight: 500;
    font-size: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    position: relative;
    z-index: 10;
    margin: 2px 4px;
    user-select: none;
    cursor: grab;
  }
  .timeline-bar.editable-false {
    cursor: default;
  }
  .timeline-bar.dragging {
    cursor: grabbing;
  }

  .timeline-bar:hover:not(.editable-false) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .timeline-bar.status-planned {
    background: linear-gradient(135deg, #a2a9ba 0%, #a2a9ba 100%);
  }

  .timeline-bar.status-in-progress {
    background: linear-gradient(135deg, #7ea8f5 0%, #518eff 100%);
  }

  .timeline-bar.status-completed {
    background: linear-gradient(135deg, #4bbd50 0%, #00c10a 100%);
  }

  .timeline-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }

  .resize-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 10px;
    cursor: ew-resize;
    z-index: 20;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .timeline-bar.editable-false .resize-handle {
    display: none;
  }

  .resize-handle:hover,
  .timeline-bar:hover .resize-handle {
    opacity: 1;
  }

  .resize-handle-start {
    left: 0;
    background: linear-gradient(to right, rgba(255, 255, 255, 0.3), transparent);
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  .resize-handle-end {
    right: 0;
    background: linear-gradient(to left, rgba(255, 255, 255, 0.3), transparent);
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
</style>
