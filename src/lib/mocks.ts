import type { ServerFunctions, RoadmapItem } from '../global';
import { getSpreadsheetName } from './RoadmapProvider.svelte';

// Add your server functions here
export const mocks: ServerFunctions = {
  getSpreadsheetName: async () => {
    console.log('[MOCK] Server function getSpreadsheetName executed');
    return 'Mock Spreadsheet Name';
  },
  getRoadmapData: async () => {
    console.log('[MOCK] Server function getRoadmapData executed');
    try {
      const result = await import('../roadmap-data.json');
      let items = result.default as RoadmapItem[];
      return items;
    } catch (jsonError) {
      console.error('Error loading local JSON data:', jsonError);
    }
    return;
  },
  updateSpreadsheet: async (item: RoadmapItem) => {
    console.log('[MOCK] Server function updateSpreadsheet executed');
    // TODO: update roadmap-data.json
    return true;
  },
  addRoadmapItem: async (item: RoadmapItem) => {
    console.log('[MOCK] Server function addRoadmapItem executed');
    // TODO: update roadmap-data.json
    return true;
  },
  removeRoadmapItem: async (index: number) => {
    console.log('[MOCK] Server function removeRoadmapItem executed');
    // TODO: update roadmap-data.json
    return true;
  }
  // You can add more mock server functions here as needed
}
