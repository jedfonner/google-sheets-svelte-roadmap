<script lang="ts">
  import type { RoadmapItem } from '../global';
  import DependencyLine from './DependencyLine.svelte';

  let { items, updateSpreadsheet } = $props();
</script>

{#each items as item}
  {#if item.dependencies && item.dependencies.length > 0}
    {#each item.dependencies as dependencyId}
      {@const dependent = items.filter((item: RoadmapItem) => item.id == dependencyId)}
      {#if dependent.length === 1}
        <DependencyLine {item} dependent={dependent[0]} persistChanges={updateSpreadsheet} />
      {/if}
    {/each}
  {/if}
{/each}
