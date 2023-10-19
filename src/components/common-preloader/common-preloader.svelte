<script lang="ts">
  import { ProgressRadial } from '@skeletonlabs/skeleton';
  import { GlobalPreloader } from '../../stores/global-preloader';
  import { fade } from 'svelte/transition';
</script>

{#if $GlobalPreloader.visible}
  <div
    out:fade={{ duration: 300 }}
    class="fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center flex-col backdrop-blur-md bg-surface-50 dark:bg-surface-600 !bg-opacity-50">
    <ProgressRadial stroke={80} meter="stroke-primary-500" track="stroke-primary-500/30" />
    <h3 class="h3 text-center mt-3 text-current">{$GlobalPreloader.description}</h3>
  </div>
{/if}
