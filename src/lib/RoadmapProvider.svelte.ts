import { setContext, getContext } from 'svelte';
import type { RoadmapItem } from '../global';

export interface RoadmapState {
  items: RoadmapItem[];
  PIs: string[];
  status: 'idle' | 'loading' | 'error' | 'loaded';
}

let roadmapState: RoadmapState = $state({
  items: [],
  PIs: [],
  status: 'idle'
})

export const initRoadmapState = (): RoadmapState => {
  return setContext('roadmapState', roadmapState);
}

export const loadDataFromSpreadsheet = async (): Promise<RoadmapState> => {
  roadmapState.status = 'loading';
  await window.google.script.run
    .withSuccessHandler((response: any) => {
      console.log('Loaded data from Spreadsheet', response);
      roadmapState.items = structuredClone(response) as RoadmapItem[];
      // Extract unique PIs from items
      const piSet = new Set<string>();
      roadmapState.items.forEach((item) => {
        if (item.startPi) piSet.add(item.startPi);
        if (item.endPi) piSet.add(item.endPi);
      });
      roadmapState.PIs = Array.from(piSet).sort();
      roadmapState.status = 'loaded';
    })
    .withFailureHandler((error: any) => {
      roadmapState.status = 'error';
      console.error('Error invoking server function:', error);
      alert('Failed to invoke server function.');
    })
    .getRoadmapData();
  return roadmapState;
}

export const getRoadmapState = (): RoadmapState => {
  return getContext('roadmapState');
}


export const updateSpreadsheet = async (item: RoadmapItem): Promise<boolean> => {
  console.log('Updating item in spreadsheet:', $state.snapshot(item));
  try {
    roadmapState.items = roadmapState.items.map((i) => (i.id == item.id ? item : i));
    await window.google.script.run
      .withSuccessHandler((response: boolean) => {
        console.log(`Spreadsheet ${response ? 'successfully updated' : 'failed to update'}`);
        return response;
      })
      .withFailureHandler((error: any) => {
        console.error('Error updating spreadsheet:', error);
      })
      .updateSpreadsheet(item);
  } catch (error) {
    console.error('Error invoking server function:', error);
  }
  return false;
}

export const addChildItem = async (parentItem: RoadmapItem): Promise<void> => {
  const newItem: RoadmapItem = {
    id: crypto.randomUUID(),
    parentId: parentItem.id,
    title: 'New Item',
    owner: 'TBD',
    status: 'planned',
    startPi: parentItem.startPi || roadmapState.PIs[0],
    endPi: parentItem.endPi || roadmapState.PIs[1],
  };
  const index = roadmapState.items.findIndex((item) => item.id === parentItem.id);
  roadmapState.items.splice(index + 1, 0, newItem);

  try {
    console.log('Adding new item to spreadsheet:', newItem);
    await window.google.script.run
      .withSuccessHandler((response: boolean) => {
        console.log(`Spreadsheet ${response ? 'successfully updated' : 'failed to update'}`);
        return response;
      })
      .withFailureHandler((error: any) => {
        console.error('Error updating spreadsheet:', error);
      })
      .addRoadmapItem(newItem, index + 1);
  } catch (error) {
    console.error('Error invoking server function:', error);
  }
}

export const removeItem = async (itemToRemove: RoadmapItem): Promise<void> => {
  const index = roadmapState.items.findIndex((item) => item.id === itemToRemove.id);
  if (index !== -1) {
    roadmapState.items.splice(index, 1);

    try {
      console.log('Removing item to spreadsheet:', index);
      await window.google.script.run
        .withSuccessHandler((response: boolean) => {
          console.log(
            `Spreadsheet ${response ? 'successfully updated' : 'failed to update'}`,
          );
          return response;
        })
        .withFailureHandler((error: any) => {
          console.error('Error updating spreadsheet:', error);
        })
        .removeRoadmapItem(index);
    } catch (error) {
      console.error('Error invoking server function:', error);
    }
  }
}
