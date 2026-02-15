import { setContext, getContext } from 'svelte';

export interface ConfirmState {
  title: string;
  body: string;
  onSubmit: Function;
  isVisible: boolean
}
let confirmState: ConfirmState = $state({
  title: '',
  body: '',
  onSubmit: () => { },
  isVisible: false,
});

export const initConfirmState = () => {
  return setContext('confirmState', confirmState);
}

export const updateConfirmState = (title: string, body: string, onSubmit: Function, isVisible: boolean) => {
  confirmState.title = title;
  confirmState.body = body;
  confirmState.onSubmit = onSubmit;
  confirmState.isVisible = isVisible;
}

export const getConfirmState = (): ConfirmState => {
  return getContext('confirmState');
}

export const showConfirmDialog = (title: string, body: string, onSubmit: Function) => {
  confirmState.title = title;
  confirmState.body = body;
  confirmState.onSubmit = onSubmit;
  confirmState.isVisible = true
}


