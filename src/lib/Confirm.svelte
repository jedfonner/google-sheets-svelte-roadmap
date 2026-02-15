<script lang="ts">
  import { getConfirmState } from './state.svelte';
  import { onMount } from 'svelte';
  const confirmState = getConfirmState();
  $inspect('Confirm State', confirmState);

  let dialog: HTMLDialogElement | undefined = $state();

  const approve = () => {
    confirmState.isVisible = false;
    confirmState.onSubmit(true);
  };

  const reject = () => {
    confirmState.isVisible = false;
    confirmState.onSubmit(false);
  };

  onMount(() => {
    /* Handles Escape key and click outside */
    dialog?.addEventListener('close', (e) => {
      confirmState.isVisible = false;
    });
  });

  $effect(() => {
    if (confirmState.isVisible) {
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  });
</script>

<dialog class="confirm" bind:this={dialog}>
  <h3>{confirmState.title}</h3>
  <p>{confirmState.body}</p>
  <div class="buttons">
    <button class="approve" onclick={approve}>Yes</button>
    <button class="reject" onclick={reject}>No</button>
  </div>
</dialog>

<style>
  dialog {
    transition:
      display 500ms allow-discrete,
      overlay 500ms allow-discrete;

    animation: close 500ms forwards;
    &[open] {
      animation: open 500ms forwards;
    }
  }
  @keyframes open {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes close {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  ::backdrop {
    background-color: black;
    opacity: 0.4;
  }
  .confirm {
    transform: translateY(-50%);
    max-width: 33vw;
    padding: 2rem;
    border-radius: 1rem;
    border: 1px solid black;
    box-shadow: 0.5rem 0.5rem 2rem rgba(0 0 0 / 0.8);
  }
  .buttons {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 2rem 0 0 0;
  }
  button {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid white;
  }
  button.approve {
    background-color: green;
  }
  button.reject {
    background-color: rgb(115, 0, 0);
  }
</style>
