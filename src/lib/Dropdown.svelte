<script lang="ts">
  interface Option {
    label: string;
    value: string;
  }
  interface FieldProps {
    options: Option[];
    value: string;
    onChange: () => void;
    allowUserToEdit?: boolean;
  }
  let {
    options,
    value = $bindable(),
    onChange,
    allowUserToEdit = false,
  }: FieldProps = $props();

  function getDisplayValue(value: string): string {
    const option = options.find((opt: { value: string }) => opt.value === value);
    return option ? option.label : value;
  }
  function handleOnKeyDown(event: KeyboardEvent) {
    if (!allowUserToEdit) return;
    if (event.key === 'Enter') {
      isEditable = false;
      onChange && onChange();
    } else if (event.key == 'Escape') {
      isEditable = false;
    }
  }

  function clickOutside(node: HTMLElement) {
    const handleClick = (event: MouseEvent) => {
      if (!node.contains(event.target as Node)) {
        isEditable = false;
      }
    };
    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }
  function selectKeydown(node: HTMLElement) {
    document.addEventListener('keydown', handleOnKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleOnKeyDown, true);
    };
  }

  let isEditable = $state(false);
</script>

{#if isEditable}
  <!-- svelte-ignore a11y_autofocus -->
  <select
    bind:value
    {@attach clickOutside}
    {@attach selectKeydown}
    class="dropdown editable"
    onchange={() => {
      isEditable = false;
      onChange && onChange();
    }}
  >
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
{:else}
  <div
    class="dropdown display"
    class:clickable={allowUserToEdit}
    role="button"
    tabindex="0"
    title={allowUserToEdit ? 'Click to edit' : ''}
    onclick={() => (isEditable = allowUserToEdit && true)}
    onkeydown={handleOnKeyDown}
  >
    {getDisplayValue(value)}
  </div>
{/if}

<style>
  .dropdown.display.clickable {
    cursor: pointer;
  }
  .dropdown {
    width: 90%;
  }
</style>
