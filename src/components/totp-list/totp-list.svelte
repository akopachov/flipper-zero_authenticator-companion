<script lang="ts">
  import { dndzone, SOURCES, TRIGGERS, type DndEvent } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';
  import type { TokenInfoBase } from '$models/token-info';
  import { findIcon } from '$lib/totp-icons';
  import { popup, type ModalSettings, type PopupSettings, getModalStore } from '@skeletonlabs/skeleton';
  import delay from 'delay';

  type ListItemWrapper = {
    id: string;
    item: TokenInfoBase;
  };

  let {
    list = [],
    move: moveToken,
    delete: deleteToken,
  }: {
    list: TokenInfoBase[];
    move: (args: { from: number; to: number }) => void;
    delete: (args: { element: Element; token: TokenInfoBase }) => void;
  } = $props();

  const modalStore = getModalStore();
  let flipAnimationMs = $state(200);
  let internalList: ListItemWrapper[] = $state([]);

  function getTotpItemMenuSettings(index: number | string): PopupSettings {
    return {
      event: 'click',
      target: `totpItemMenu_${index}`,
      placement: 'bottom-end',
      middleware: {
        offset: () => ({ mainAxis: 5, alignmentAxis: 5 }),
      },
    };
  }

  $effect(() => {
    flipAnimationMs = 0;
    internalList = list.map((m, index) => ({ id: String(index), item: m }));
    delay(100).then(() => (flipAnimationMs = 200));
  });

  let dragDisabled = $state(true);

  function getIcon(name: string) {
    const iconFileName = findIcon(name) || 'Key.svg';
    return `/totp-icons/${iconFileName}`;
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

    moveToken({ from, to });
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
      body: `<p>Are you sure you wish to delete token "${token.name}"?</p>
      <p class="uppercase font-semibold text-rose-600"><br />Warning!</p>
      <p class="uppercase font-semibold">This action is irreversable. You will not be able to restore your token back</p>
      `,
      response: (confirmed: boolean) => {
        if (confirmed) {
          deleteToken({ element: e.target as Element, token: token });
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

{#if internalList?.length > 0}
  <ul
    class="list p-4 pt-3 pb-3"
    use:dndzone={{
      items: internalList,
      dragDisabled,
      flipDurationMs: flipAnimationMs,
      dropTargetStyle: {},
      transformDraggedElement,
    }}
    onconsider={handleConsider}
    onfinalize={handleFinalize}>
    {#each internalList as item (item.id)}
      {@const totp = item.item}
      <div animate:flip={{ duration: flipAnimationMs }}>
        <li class="h-14 p-1">
          <i
            class="material-icons drag-handle cursor-move"
            onmousedown={startDrag}
            ontouchstart={startDrag}
            onkeydown={handleKeyDown}
            role="none">
            <svg
              viewBox="0 0 16 16"
              stroke-width="1.5"
              fill="currentColor"
              class="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                d="M7.375 3.67c0-.645-.56-1.17-1.25-1.17s-1.25.525-1.25 1.17c0 .646.56 1.17 1.25 1.17s1.25-.524 1.25-1.17zm0 8.66c0-.646-.56-1.17-1.25-1.17s-1.25.524-1.25 1.17c0 .645.56 1.17 1.25 1.17s1.25-.525 1.25-1.17zm-1.25-5.5c.69 0 1.25.525 1.25 1.17 0 .645-.56 1.17-1.25 1.17S4.875 8.645 4.875 8c0-.645.56-1.17 1.25-1.17zm5-3.16c0-.645-.56-1.17-1.25-1.17s-1.25.525-1.25 1.17c0 .646.56 1.17 1.25 1.17s1.25-.524 1.25-1.17zm-1.25 7.49c.69 0 1.25.524 1.25 1.17 0 .645-.56 1.17-1.25 1.17s-1.25-.525-1.25-1.17c0-.646.56-1.17 1.25-1.17zM11.125 8c0-.645-.56-1.17-1.25-1.17s-1.25.525-1.25 1.17c0 .645.56 1.17 1.25 1.17s1.25-.525 1.25-1.17z" />
            </svg>
          </i>
          <img class="avatar-image h-full w-auto object-cover" src={getIcon(totp.name)} alt="icon" />
          <p class="flex-auto block min-w-0">
            <span class="block text-base truncate">{totp.name}</span>
            <span class="block text-sm uppercase">{totp.type}, {totp.hashingAlgo}</span>
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
          <div class="card p-4 w-48 shadow-md !transition-none !duration-0" data-popup="totpItemMenu_{item.id}">
            <nav class="list-nav">
              <ul>
                <li>
                  <a class="flex-auto" href="/update/{item.item.id}">
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
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    <span class="flex-auto">Edit</span>
                  </a>
                </li>
                <li>
                  <button class="flex-auto" type="button" onclick={e => handleDeleteToken(e, item.item)}>
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
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    <span class="flex-auto text-left">Delete</span>
                  </button>
                </li>
              </ul>
            </nav>
            <div class="arrow bg-surface-100-800-token !left-[10.333rem]"></div>
          </div>
        </li>
      </div>
    {/each}
  </ul>
{:else}
  <div class="flex justify-center flex-col w-full h-full items-center">
    <h3 class="h3 block mb-5">Token list is empty</h3>
    <a class="btn variant-filled-primary btn-lg max-w-[15rem]" href="/update">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      <span>Add new token</span>
    </a>
  </div>
{/if}
