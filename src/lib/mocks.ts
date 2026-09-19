import type { ServerFunctions, RoadmapItem } from '../global';
import { moveRoadmapItem } from './RoadmapProvider.svelte';

// Add your server functions here
export const mocks: ServerFunctions = {
  getSpreadsheetInfo: async () => {
    console.log('[MOCK] Server function getSpreadsheetInfo executed');
    return { name: 'Mock Spreadsheet Name', url: 'https://docs.google.com/spreadsheets/d/mock-spreadsheet-id' };
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
    console.log('[MOCK] Server function updateSpreadsheet executed', item);
    return true;
  },
  addRoadmapItem: async (item: RoadmapItem) => {
    console.log('[MOCK] Server function addRoadmapItem executed', item);
    return true;
  },
  removeRoadmapItem: async (index: number) => {
    console.log('[MOCK] Server function removeRoadmapItem executed', index);
    return true;
  },
  moveRoadmapItem: async (fromIndex: number, toIndex: number) => {
    console.log('[MOCK] Server function moveRoadmapItem executed', fromIndex, toIndex);
    return true;
  }
  // You can add more mock server functions here as needed
}
