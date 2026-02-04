<script lang="ts">
  import { onMount } from 'svelte';
  import { type RoadmapItem } from '../global';
  let { item, dependent } = $props();
  $inspect('DependencyLine item', item);
  $inspect('DependencyLine dependent', dependent);
  interface Line {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }
  let line: Line | undefined = $state();

  const updateLine = (from: RoadmapItem, to: RoadmapItem) => {
    console.log('updateLine called');
    const fromId = from.id;
    const toId = to.id;
    console.log(`Trying to build line from ${fromId} to ${toId}`);
    const fromEl = document.querySelector(`[data-item-id="${fromId}`);
    const toEl = document.querySelector(`[data-item-id="${toId}`);
    const container = document.querySelector('.roadmap-container');

    if (!fromEl || !toEl) {
      console.warn('Cannot find fromEl or toEl');
      return;
    }
    const rect1 = fromEl.getBoundingClientRect();
    console.log(`Rect1 bounding box: ${JSON.stringify(rect1)}`);
    const rect2 = toEl.getBoundingClientRect();
    console.log(`Rect2 bounding box: ${JSON.stringify(rect2)}`);

    // Right edge center of div1
    const x1 = rect1.left;
    const y1 = rect1.top + rect1.height / 2;

    // Left edge center of div2
    const x2 = rect2.right;
    const y2 = rect2.top + rect2.height / 2;

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

  $inspect('Line', line);
</script>

{#if line}
  {@const midX = line.x1 + (line.x2 - line.x1) * (1 / 3)}
  <svg class="line-overlay">
    <defs>
      <marker
        id="arrow-start"
        markerWidth="10"
        markerHeight="10"
        refX="0"
        refY="5"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
      </marker>
    </defs>
    <path
      d={`M ${line.x1 - 10} ${line.y1}
          L ${midX} ${line.y1}
          L ${midX} ${line.y2}
          L ${line.x2} ${line.y2}`}
      stroke="black"
      stroke-width="1"
      fill="none"
      marker-start="url(#arrow-start)"
    />
  </svg>
{/if}

<style>
  .line-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999; /* High enough to be above everything */
  }
</style>
