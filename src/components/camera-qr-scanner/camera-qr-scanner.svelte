<script lang="ts">
  import { ProgressRadial } from '@skeletonlabs/skeleton';
  import QrScanner from 'qr-scanner';
  import { onDestroy, onMount } from 'svelte';

  let videoEl: HTMLVideoElement | null = $state(null);
  let qrScanner: QrScanner;

  let { scanned }: { scanned: (arg: { data: string }) => void } = $props();

  let availableCameraDevices: MediaDeviceInfo[] | null = $state(null);
  let selectedCamera: MediaDeviceInfo;
  let isScanning = $state(true);
  let scannerStartingPromise: Promise<void> | null;

  async function startQrScanner(camera: MediaDeviceInfo) {
    if (qrScanner && camera) {
      if (scannerStartingPromise) {
        scannerStartingPromise.then(() => startQrScanner(camera));
        return;
      }
      await qrScanner.setCamera(camera.deviceId);
      await qrScanner.start();
      scannerStartingPromise = null;
    }
  }

  $effect(() => {
    if (isScanning) {
      startQrScanner(selectedCamera);
    } else {
      qrScanner?.stop();
    }
  });

  $effect(() => {
    if (videoEl) {
      if (qrScanner) {
        qrScanner.stop();
        qrScanner.destroy();
      }

      qrScanner = new QrScanner(
        videoEl,
        result => {
          isScanning = false;
          scanned({ data: result.data });
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
        },
      );
    }
  });

  async function loadCameraDevices() {
    let devices = await navigator.mediaDevices.enumerateDevices();
    availableCameraDevices = devices.filter(f => f.kind === 'videoinput');
    if (availableCameraDevices.length > 0) {
      selectedCamera = availableCameraDevices[0];
    }
  }

  export function reset() {
    isScanning = true;
  }

  onMount(() => {
    loadCameraDevices();
  });
  onDestroy(() => {
    if (qrScanner) {
      qrScanner.destroy();
    }
  });
</script>

<div class="flex justify-center">
  {#if availableCameraDevices && availableCameraDevices.length > 0}
    <div class="flex flex-col w-full relative" class:hidden={!isScanning}>
      <select class="select" bind:value={selectedCamera}>
        {#each availableCameraDevices as cameraDevice (cameraDevice.deviceId)}
          <option value={cameraDevice}>{cameraDevice.label}</option>
        {/each}
      </select>
      <!-- svelte-ignore a11y-media-has-caption -->
      <video class="w-full mt-3" bind:this={videoEl}></video>
    </div>
  {:else if availableCameraDevices && availableCameraDevices.length <= 0}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Holy smokes!</strong>
      <span class="block sm:inline">There are no available video input devices found.</span>
    </div>
  {:else}
    <ProgressRadial stroke={40} meter="stroke-primary-500" track="stroke-primary-500/30" />
  {/if}
</div>
