<script lang="ts">
  import CircularProgress from '@smui/circular-progress';
  import { GlobalPreloader } from '../../stores/global-preloader';
  import { fade } from 'svelte/transition';
</script>

{#if $GlobalPreloader.visible}
  <div out:fade={{ duration: 300 }} class="processing-request">
    <CircularProgress class="progress" style="height: 128px; width: 128px;" indeterminate />
    <h5 class="description">{$GlobalPreloader.description}</h5>
  </div>
{/if}

<style lang="scss">
  .processing-request {
    position: fixed;
    top: 0;
    left: 0;
    width: 100svw;
    height: 100svh;
    z-index: 998;
    background-color: var(--preloader-background);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .description {
      text-align: center;
    }
  }
</style>
