<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import List, { Graphic, Item, Meta, PrimaryText, SecondaryText, Text } from '@smui/list';
  import IconButton from '@smui/icon-button';
  import { dndzone, SOURCES, TRIGGERS, type DndEvent } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';
  import type { TokenInfoBase } from '$models/token-info';
  import { findIcon } from '$lib/totp-icons';
  import { debounce } from 'lodash-es';

  type ListItemWrapper = {
    id: string;
    item: TokenInfoBase;
  };

  const dispatch = createEventDispatcher();
  export let list: TokenInfoBase[] = [];
  let flipAnimationMs = 200;
  let internalList: ListItemWrapper[];

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

  function handleTokenMenu(e: CustomEvent, token: TokenInfoBase) {
    dispatch('tokenmenu', { element: e.target as Element, token: token });
  }

  function transformDraggedElement(draggedEl?: HTMLElement) {
    if (draggedEl) {
      draggedEl.classList.add(
        'mdc-deprecated-list',
        'mdc-deprecated-list--avatar-list',
        'mdc-deprecated-list--two-line',
      );
    }
  }
</script>

<List twoLine avatarList nonInteractive>
  <div
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
        <Item>
          <i
            class="material-icons drag-handle"
            on:mousedown={startDrag}
            on:touchstart={startDrag}
            on:keydown={handleKeyDown}
            role="none">
            drag_indicator
          </i>
          <Graphic>
            <img src={getIcon(totp.name)} alt="icon" />
          </Graphic>
          <Text>
            <PrimaryText>{totp.name}</PrimaryText>
            <SecondaryText>{totp.hashingAlgo}</SecondaryText>
          </Text>
          <Meta>
            <IconButton class="material-icons" on:click={e => handleTokenMenu(e, totp)}>more_vert</IconButton>
          </Meta>
        </Item>
      </div>
    {/each}
  </div>
</List>

<style lang="scss">
  .drag-handle {
    cursor: grab;
    margin-left: -12px;
    margin-right: 6px;
  }
</style>
