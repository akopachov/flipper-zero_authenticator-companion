<script lang="ts">
  import log from 'electron-log';
  import { rpcToMain } from '$lib/electron-rpc/electron-rpc_renderer';
  import { takeScreenShot } from '$lib/screenshot';
  import { GlobalPreloader } from '$stores/global-preloader';
  import { ProgressRadial } from '@skeletonlabs/skeleton';
  import QrScanner from 'qr-scanner';
  import { createEventDispatcher, onMount } from 'svelte';

  type ScanSource = { id: string; name: string; thumbnail: string };

  const dispatch = createEventDispatcher();

  let screenSources: ScanSource[] | null = null;

  async function getSources() {
    screenSources = await rpcToMain('get-screen-sources', { thumbnailSize: 200 });
  }

  async function scanQrCodeAtSource(source: ScanSource) {
    GlobalPreloader.show(`Looking for QR code at ${source.name}`);
    let screenShot: ImageBitmap | null = null;
    try {
      screenShot = await takeScreenShot(source.id);
    } catch (e) {
      log.warn('An error occurred during taking screenshot', e);
    }

    let scanResult: QrScanner.ScanResult | null = null;
    if (screenShot) {
      try {
        scanResult = await QrScanner.scanImage(screenShot, { returnDetailedScanResult: true });
      } catch {
        /* empty */
      } finally {
        screenShot.close();
      }
    }

    GlobalPreloader.hide();

    dispatch('scanned', { data: scanResult?.data });
  }

  onMount(() => getSources());
</script>

<section class="flex justify-center gap-3 flex-wrap">
  {#if screenSources !== null}
    {#each screenSources as source}
      <button
        class="btn variant-filled block !p-0 w-[200px] rounded-lg overflow-hidden"
        type="button"
        on:click={() => scanQrCodeAtSource(source)}>
        <img class="h-auto max-w-full" src={source.thumbnail} alt="Thumbnail of {source.name}" />
        <p class="truncate p-1" title={source.name}>{source.name}</p>
      </button>
    {/each}
  {:else}
    <ProgressRadial stroke={40} meter="stroke-primary-500" track="stroke-primary-500/30" />
  {/if}
</section>
