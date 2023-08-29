<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { dndzone, SOURCES, TRIGGERS, type DndEvent } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';
  import type { TokenInfoBase } from '$models/token-info';
  import { findIcon } from '$lib/totp-icons';
  import { debounce } from 'lodash-es';
  import { popup, type ModalSettings, type PopupSettings, getModalStore } from '@skeletonlabs/skeleton';

  type ListItemWrapper = {
    id: string;
    item: TokenInfoBase;
  };

  const modalStore = getModalStore();
  const dispatch = createEventDispatcher();
  export let list: TokenInfoBase[] = [];
  let flipAnimationMs = 200;
  let internalList: ListItemWrapper[];

  function getTotpItemMenuSettings(index: number | string): PopupSettings {
    return {
      event: 'click',
      target: `totpItemMenu_${index}`,
      placement: 'left',
      middleware: {
        offset: 15,
      },
    };
  }

  $: {
    flipAnimationMs = 0;
    internalList = list.map((m, index) => ({ id: String(index), item: m }));
    debounce(() => (flipAnimationMs = 200), 100)();
  }

  let dragDisabled = true;

  function getIcon(name: string) {
    const iconFileName = findIcon(name) || 'Key.svg';
    return `./totp-icons/${iconFileName}`;
  }

  function handleConsider(e: CustomEvent<DndEvent<ListItemWrapper>>) {
    const {
      items: newItems,
      info: { source, trigger },
    } = e.detail;
    internalList = newItems;
    if (source === SOURCES.KEYBOARD && trigger === TRIGGERS.DRAG_STOPPED) {
      dragDisabled = true;
    }
  }

  function handleFinalize(e: CustomEvent<DndEvent<ListItemWrapper>>) {
    const {
      items: newItems,
      info: { source, id },
    } = e.detail;
    internalList = newItems;
    if (source === SOURCES.POINTER) {
      dragDisabled = true;
    }

    const from = Number(id);
    const to = internalList.findIndex(p => p.id === id);

    dispatch('move', { from, to });
  }
  function startDrag(e: Event) {
    e.preventDefault();
    dragDisabled = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ' ') && dragDisabled) dragDisabled = false;
  }

  function handleDeleteToken(e: Event, token: TokenInfoBase) {
    const modal: ModalSettings = {
      type: 'confirm',
      title: 'Please Confirm',
      body: `Are you sure you wish to delete token ${token.name}?`,
      response: (confirmed: boolean) => {
        if (confirmed) {
          dispatch('delete', { element: e.target as Element, token: token });
        }
      },
    };
    modalStore.trigger(modal);
  }

  function transformDraggedElement(draggedEl?: HTMLElement) {
    if (draggedEl) {
      draggedEl.classList.add('list', 'focus-visible:outline-none');
    }
  }
</script>

<ul
  class="list p-4 pt-3 pb-3"
  use:dndzone={{
    items: internalList,
    dragDisabled,
    flipDurationMs: flipAnimationMs,
    dropTargetStyle: {},
    transformDraggedElement,
  }}
  on:consider={handleConsider}
  on:finalize={handleFinalize}>
  {#each internalList as item (item.id)}
    {@const totp = item.item}
    <div animate:flip={{ duration: flipAnimationMs }}>
      <li class="h-14 p-1">
        <i
          class="material-icons drag-handle cursor-move"
          on:mousedown={startDrag}
          on:touchstart={startDrag}
          on:keydown={handleKeyDown}
          role="none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
          </svg>
        </i>
        <img class="avatar-image h-full w-auto object-cover" src={getIcon(totp.name)} alt="icon" />
        <p class="flex-auto block min-w-0">
          <span class="block text-base truncate">{totp.name}</span>
          <span class="block text-sm uppercase">{totp.hashingAlgo}</span>
        </p>
        <button type="button" use:popup={getTotpItemMenuSettings(item.id)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
          </svg>
        </button>
        <div class="card p-4 w-72 shadow-xl" data-popup="totpItemMenu_{item.id}">
          <nav class="list-nav">
            <ul>
              <li>
                <a class="flex-auto" href="/update/{item.item.id}">Edit</a>
              </li>
              <li>
                <button class="flex-auto" type="button" on:click={e => handleDeleteToken(e, item.item)}>Delete</button>
              </li>
            </ul>
          </nav>
          <div class="arrow bg-surface-100-800-token" />
        </div>
      </li>
    </div>
  {/each}
</ul>
