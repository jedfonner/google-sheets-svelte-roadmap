<script lang="ts">
  import type { RoadmapItem } from './global';
  import Roadmap from './lib/Roadmap.svelte';
  import { onMount } from 'svelte';
  import {
    getRoadmapState,
    initRoadmapState,
    getSpreadsheetInfo,
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
  let url = $state('');

  onMount(async () => {
    const info = await getSpreadsheetInfo();
    title = info.name;
    url = info.url;
    await loadDataFromSpreadsheet();
  });
</script>

<svelte:head>
  <title>{import.meta.env.DEV ? `[DEV] ${title}` : title}</title>
</svelte:head>

<main>
  <header>
    <h1><a href={url} target="_blank" title="Open Spreadsheet">{title}</a></h1>
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
  h1 a {
    text-decoration: none;
    color: inherit;
  }
  h1:hover a {
    text-decoration: underline;
  }
  h1:hover a::after {
    content: ' ↗';
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
