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

export const getSpreadsheetInfo = (): Promise<{ name: string; url: string }> => {
  return new Promise((resolve, reject) => {
    window.google.script.run
      .withSuccessHandler((response: { name: string; url: string }) => {
        console.log('Spreadsheet info from server:', response);
        resolve(response);
      })
      .withFailureHandler((error: any) => {
        console.error('Error invoking server function getSpreadsheetInfo:', error);
        reject(error);
      })
      .getSpreadsheetInfo();
  });
}

export const loadDataFromSpreadsheet = (): Promise<RoadmapState> => {
  console.log('Loading data from spreadsheet...');
  return getRoadmapData(true);
}
export const refreshDataFromSpreadsheet = (): Promise<RoadmapState> => {
  console.log('Refreshing data from spreadsheet without cache...');
  return getRoadmapData(false);
}
const getRoadmapData = (useCache = true): Promise<RoadmapState> => {
  roadmapState.status = 'loading';
  return new Promise((resolve, reject) => {
    window.google.script.run
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
        resolve(roadmapState);
      })
      .withFailureHandler((error: any) => {
        roadmapState.status = 'error';
        console.error('Error invoking server function getRoadmapData:', error);
        reject(error);
      })
      .getRoadmapData(useCache);
  });
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

export const moveRoadmapItem = async (fromIndex: number, toIndex: number): Promise<void> => {
  console.log('Moving item in spreadsheet: from:', fromIndex, 'to index:', toIndex);
  try {
    await window.google.script.run
      .withSuccessHandler((response: boolean) => {
        console.log(`Item ${response ? 'successfully moved' : 'failed to move'}`);
        return;
      })
      .withFailureHandler((error: any) => {
        console.error('Error updating spreadsheet:', error);
      }).moveRoadmapItem(fromIndex, toIndex);
  } catch (error) {
    console.error('Error invoking server function:', error);
  }
  return;
}

export const addChildItem = async (parentItem: RoadmapItem): Promise<void> => {
  const lastChildIndex = roadmapState.items.findLastIndex((item) => item.parentId === parentItem.id);
  const lastChild = roadmapState.items[lastChildIndex];
  const newItem: RoadmapItem = {
    id: crypto.randomUUID(),
    parentId: parentItem.id,
    title: 'NEW ITEM - Click to rename',
    owner: 'TBD',
    status: 'planned',
    startPi: lastChild.startPi,
    endPi: lastChild.endPi,
  };
  console.log('Adding new item at index ' + (lastChildIndex + 1))
  roadmapState.items.splice(lastChildIndex + 1, 0, newItem);

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
      .addRoadmapItem(newItem, lastChildIndex + 1);
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
