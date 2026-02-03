import type { ServerFunctions, RoadmapItem } from '../global';

// Add your server functions here
export const mocks: ServerFunctions = {
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
  }
  // You can add more mock server functions here as needed
}
