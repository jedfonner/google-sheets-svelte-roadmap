<script lang="ts">
  import type { RoadmapItem } from './global';
  import Roadmap from './lib/Roadmap.svelte';
  import { onMount } from 'svelte';
  import {
    getRoadmapState,
    initRoadmapState,
    getSpreadsheetInfo,
    loadDataFromSpreadsheet,
    refreshDataFromSpreadsheet,
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
    <button
      class="refresh"
      type="button"
      onclick={refreshDataFromSpreadsheet}
      title="Refresh Data">⟳</button
    >
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
    display: grid;
    grid-template-columns: 1fr auto auto;
    grid-gap: 10px;
    padding: 1rem;
  }
  header button.refresh {
    font-size: 1.2rem;
    padding: 0.2rem 0.5rem;
    cursor: pointer;
    border: none;
    background-color: unset;
    margin-top: -10px;
  }
  header button.refresh:hover {
    transform: scale(1.1);
    color: yellow;
  }
  header button.refresh:active {
    transform: scale(0.9);
    transform: rotate(0.5turn);
    transition: transform 0.5s linear;
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
