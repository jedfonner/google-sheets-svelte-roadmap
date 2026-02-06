interface ServerFunctions {
  [key: string]: (...args: any[]) => void;
}

interface MockProxy {
  withSuccessHandler(fn: (result?: any) => void): MockProxy;
  withFailureHandler(fn: (error: Error) => void): MockProxy;
  [key: string]: any; // Allow indexing for the proxy to work
}

interface GasError {
  message?: string;
  name?: string;
  stack?: string;
  [key: string]: any;
}

export type RoadmapItemStatus = '' | 'planned' | 'in-progress' | 'completed';
export interface RoadmapItem {
  id: string;
  title: string;
  owner: string;
  startPi: string;
  endPi: string;
  parentId?: string;
  status: RoadmapItemStatus;
  dependencies?: Array<string>;
}