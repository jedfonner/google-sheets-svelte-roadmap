<script lang="ts">
  import type { RoadmapItem } from './global';
  import Roadmap from './lib/Roadmap.svelte';
  import { onMount } from 'svelte';
  import {
    getRoadmapState,
    initRoadmapState,
    getSpreadsheetName,
    loadDataFromSpreadsheet,
    type RoadmapState,
  } from './lib/RoadmapProvider.svelte';
  import { initConfirmState } from './lib/ConfirmProvider.svelte';

  // @ts-ignore
  const version = __APP_VERSION__;

  // initialize our $state variables stored in Context
  initConfirmState();
  initRoadmapState();

  let roadmap: RoadmapState = getRoadmapState();

  let title = $state('Loading...');

  onMount(async () => {
    title = await getSpreadsheetName();
    await loadDataFromSpreadsheet();
  });
</script>

<main>
  <header>
    <h1>{title}</h1>
    <span class="version">v{version}</span>
  </header>

  {#if roadmap.status === 'loading' || roadmap.status === 'idle'}
    <p>Loading...</p>
  {:else if roadmap.status === 'error'}
    <p>Error loading data.</p>
  {:else}
    <div class="roadmap-container">
      <Roadmap />
    </div>
  {/if}
</main>

<style>
  main {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
  }
  h1 {
    flex-shrink: 0;
    margin: 0;
  }
  p {
    padding: 1rem;
  }
  .roadmap-container {
    flex: 1;
    overflow: auto;
    position: relative;
  }
</style>
