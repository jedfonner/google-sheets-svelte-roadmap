<script lang="ts">
  import { onMount } from 'svelte';
  import { type RoadmapItem } from '../global';
  let { item, dependent } = $props();
  interface Line {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }
  let line: Line | undefined = $state();

  const updateLine = (from: RoadmapItem, to: RoadmapItem) => {
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

    line = { x1, y1, x2, y2 };
  };

  $effect(() => {
    // Access reactive properties so Svelte tracks them
    item.startPi;
    item.endPi;
    dependent.startPi;
    dependent.endPi;

    updateLine(item, dependent);
  });

  onMount(() => {
    const container = document.querySelector('.roadmap');
    window.addEventListener('resize', () => updateLine(item, dependent));
    container?.addEventListener('scroll', () => updateLine(item, dependent));

    return () => {
      window.removeEventListener('resize', () => updateLine(item, dependent));
      container?.removeEventListener('scroll', () => updateLine(item, dependent));
    };
  });
</script>

{#if line}
  {@const midX = line.x1 + (line.x2 - line.x1) * (1 / 3)}
  <svg class="line-overlay">
    <defs>
      <marker id="arrow-start" markerWidth="10" markerHeight="10" refX="0" refY="5" orient="0">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
      </marker>
      <marker id="circle-end" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="3" fill="context-stroke" />
      </marker>
    </defs>
    <g class="dependency-line">
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
        <title>"{item.title}" depends on "{dependent.title}"</title>
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

  .dependency-line {
    pointer-events: auto;
  }

  .dependency-line:hover .visible-line {
    stroke: red;
  }
</style>
