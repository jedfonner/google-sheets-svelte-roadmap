<script lang="ts">
  interface FieldProps {
    value: string;
    onChange: () => void;
    allowUserToEdit?: boolean;
  }
  let { value = $bindable(), onChange, allowUserToEdit = false }: FieldProps = $props();

  let isEditable = $state(false);

  function handleOnKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      isEditable = false;
      onChange && onChange();
    } else if (event.key == 'Escape') {
      isEditable = false;
    }
  }
</script>

{#if isEditable}
  <!-- svelte-ignore a11y_autofocus -->
  <input
    class="field editable"
    type="text"
    bind:value
    autofocus
    onfocusout={() => {
      isEditable = false;
      onChange && onChange();
    }}
    onkeydown={handleOnKeyDown}
  />
{:else}
  <div
    class="field display"
    class:clickable={allowUserToEdit}
    role="button"
    tabindex="0"
    title={allowUserToEdit ? 'Click to edit' : ''}
    onclick={() => (isEditable = allowUserToEdit && true)}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        isEditable = allowUserToEdit && true;
      }
    }}
  >
    {value}
  </div>
{/if}

<style>
  .field.display {
    min-width: 50px;
    min-height: 50%;
  }
  .field.display.clickable {
    cursor: pointer;
  }
  .field.editable {
    width: 90%;
  }
</style>
