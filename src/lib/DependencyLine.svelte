<script lang="ts">
  import { onMount } from 'svelte';
  import { type RoadmapItem } from '../global';
  import { updateSpreadsheet } from './RoadmapProvider.svelte';
  import { showConfirmDialog } from './ConfirmProvider.svelte';

  interface Props {
    item: RoadmapItem;
    dependent: RoadmapItem;
  }
  let { item, dependent }: Props = $props();

  let isSelected = $state(false);

  const updateLine = (from: RoadmapItem, to: RoadmapItem): Line | undefined => {
    const fromEl = document.querySelector(`[data-item-id="${from?.id}`);
    const toEl = document.querySelector(`[data-item-id="${to?.id}`);
    const container = document.querySelector('.roadmap');

    if (!fromEl || !toEl || !container) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const rect1 = fromEl.getBoundingClientRect();
    const rect2 = toEl.getBoundingClientRect();

    // Convert viewport-relative coords to container-relative (accounting for scroll)
    const offsetX = containerRect.left - container.scrollLeft;
    const offsetY = containerRect.top - container.scrollTop;

    const x1 = rect1.left - offsetX;
    const y1 = rect1.top - offsetY + rect1.height / 2;

    const x2 = rect2.right - offsetX;
    const y2 = rect2.top - offsetY + rect2.height / 2;

    return { x1, y1, x2, y2 };
  };

  interface Line {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  let line: Line | undefined = $derived.by(() => {
    // Access reactive properties so Svelte tracks them
    item.startPi;
    item.endPi;
    dependent.startPi;
    dependent.endPi;
    return updateLine(item, dependent);
  });

  onMount(() => {
    line = updateLine(item, dependent);
    const container = document.querySelector('.roadmap');
    window.addEventListener('resize', () => (line = updateLine(item, dependent)));
    container?.addEventListener('scroll', () => (line = updateLine(item, dependent)));
    return () => {
      window.removeEventListener('resize', () => (line = updateLine(item, dependent)));
      container?.removeEventListener('scroll', () => (line = updateLine(item, dependent)));
    };
  });

  const deleteLine = () => {
    showConfirmDialog(
      'Delete this dependency?',
      `Are you sure you want to delete the dependency between "${item.title}" and "${dependent.title}"?`,
      (bool: boolean) => {
        if (bool) {
          let updated = $state.snapshot(item);
          updated.dependencies = item.dependencies?.filter((id) => id != dependent.id);
          updateSpreadsheet(updated);
        }
      },
    );
  };

  const handleKeypress = (e: KeyboardEvent) => {
    if (e.key === 'Delete') {
      deleteLine();
    }
  };

  const handleClick = (node: HTMLElement) => {
    function handleClick(event: MouseEvent) {
      if ((event.target as Element).closest('[data-delete-btn]')) return;
      if (node.contains(event.target as Node)) {
        // toggle selected
        isSelected = !isSelected;
      } else {
        // if clicked outside, set to not selected
        isSelected = false;
      }
    }
    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  };
</script>

{#if line}
  {@const midX = line.x1 + (line.x2 - line.x1) * (1 / 3)}
  {@const midY = (line.y1 + line.y2) / 2}
  {@const title = `"${item.title}" depends on "${dependent.title}"
  (click to select, press Delete to remove)`}
  <svg class="line-overlay" class:selected={isSelected}>
    <defs>
      <marker id="arrow-start" markerWidth="10" markerHeight="10" refX="0" refY="5" orient="0">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
      </marker>
      <marker id="circle-end" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="3" fill="context-stroke" />
      </marker>
    </defs>
    <g
      class="dependency-line"
      onkeydown={handleKeypress}
      role="button"
      tabindex="0"
      {@attach handleClick}
    >
      <!-- Invisible wider path for easier hover -->
      <path
        d={`M ${line.x1 - 5} ${line.y1}
            L ${midX} ${line.y1}
            L ${midX} ${line.y2}
            L ${line.x2 - 5} ${line.y2}`}
        stroke="transparent"
        stroke-width="10"
        fill="none"
        style="pointer-events: stroke;"
      >
        <title>{title}</title>
      </path>
      <!-- Visible line -->
      <path
        class="visible-line"
        d={`M ${line.x1 - 5} ${line.y1}
            L ${midX} ${line.y1}
            L ${midX} ${line.y2}
            L ${line.x2 - 5} ${line.y2}`}
        stroke="black"
        stroke-width="1"
        fill="none"
        marker-start="url(#arrow-start)"
        marker-end="url(#circle-end)"
      />
      {#if isSelected}
        <foreignObject x={midX - 12} y={midY - 12} width="24" height="24">
          <button
            data-delete-btn
            onclick={deleteLine}
            class="delete-btn"
            title="Delete dependency"
          >
            <span>×</span>
          </button>
        </foreignObject>
      {/if}
    </g>
  </svg>
{/if}

<style>
  .line-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 50; /* Above timeline bars (10) but below sticky header (100) */
    overflow: visible;
  }
  .line-overlay:hover,
  .line-overlay.selected {
    z-index: 51;
  }
  .dependency-line {
    pointer-events: auto;
    outline: none;
  }
  .dependency-line:hover .visible-line {
    stroke: red;
    filter: drop-shadow(0 0 2px rgb(255, 91, 91));
  }
  .dependency-line:active .visible-line {
    stroke-width: 1.5px;
  }
  .line-overlay.selected .dependency-line .visible-line {
    stroke: red;
  }
  .delete-btn {
    width: 24px;
    height: 24px;
    border-radius: 9999px;
    border: 1px solid red;
    background-color: silver;
    color: black;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    line-height: 1;
    padding: 0;
  }
  .delete-btn:hover {
    font-weight: bold;
    border: 2px solid red;
  }
  .delete-btn:active {
    transform: scale(0.95);
  }
</style>
