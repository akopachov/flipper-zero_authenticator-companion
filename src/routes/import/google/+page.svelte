<script lang="ts">
  import log from 'electron-log';
  import { importFromGoogleAuthenticator } from '$lib/import';
  import { CommonToastType, GlobalCommonToast } from '$stores/global-common-toast';
  import { GlobalPreloader } from '$stores/global-preloader';
  import { Screenshots } from 'node-screenshots';
  import QrScanner from 'qr-scanner';
  import { onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { dataToQueryString } from '$lib/query-string-utils';

  GlobalCommonToast.initialize();

  let abortController = new AbortController();

  async function importFromGoogleAuth() {
    GlobalPreloader.show('Looking for QR code on a screen');

    let scannedData: string | null = null;
    for (const capture of Screenshots.all()) {
      const screenshot = await capture.capture();
      let scanResult: QrScanner.ScanResult | undefined;
      try {
        const blob = new Blob([screenshot]);
        scanResult = await QrScanner.scanImage(blob, { returnDetailedScanResult: true });
      } catch {
        /* empty */
      }

      if (scanResult) {
        scannedData = scanResult.data;
        break;
      }
    }

    if (scannedData) {
      try {
        const tokensParsed = importFromGoogleAuthenticator(scannedData);
        const serializedParsedTokens = dataToQueryString(tokensParsed);
        await goto(`/import/confirm?data=${serializedParsedTokens}`);
      } catch (e) {
        log.error(e);
        GlobalCommonToast.show(
          'QR code found but seems to be non-valid Google Authenticator migration QR code',
          CommonToastType.Warning,
        );
      }
    } else {
      GlobalCommonToast.show('No valid QR code found on a screen', CommonToastType.Warning);
    }

    GlobalPreloader.hide();
  }

  onDestroy(() => abortController.abort());
</script>

<div class="p-4">
  <h4 class="h4">Import from Google Authenticator</h4>
  <div class="mt-5 mb-5">
    <ol class="list-decimal ml-4">
      <li>Open Google Authenticator app on your phone</li>
      <li>Tap the hamburger-menu icon located on the top left corner</li>
      <li>Select "Transfer accounts"</li>
      <li>Select "Export accounts" and enter your PIN code when prompted</li>
      <li>Select the accounts you want to transfer into your new phone and then tap "Next"</li>
      <li>The app will display a QR code</li>
      <li>Take a screenshot of that QR code and move it to the current machine</li>
      <li>Make QR visible on a screen and click the "Scan QR Code" below</li>
    </ol>
  </div>

  <div class="flex justify-center w-full">
    <button class="btn variant-filled-primary btn-lg" on:click={importFromGoogleAuth}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 122.61 122.88"
        stroke-width="1.5"
        fill="currentColor"
        class="w-6 h-6">
        <path
          d="M26.68 26.77h25.23v25.12H26.68V26.77ZM35.67 0h-12.6a22.72 22.72 0 0 0-8.77 1.75 23.13 23.13 0 0 0-7.49 5 23.16 23.16 0 0 0-5 7.49A22.77 22.77 0 0 0 0 23.07v15.57h10.23V23.07a12.9 12.9 0 0 1 1-4.9A12.71 12.71 0 0 1 14 14a12.83 12.83 0 0 1 9.07-3.75h12.6V0Zm63.87 0h-8.23v10.23h8.23a12.94 12.94 0 0 1 4.9 1 13.16 13.16 0 0 1 4.17 2.77l.35.36a13.07 13.07 0 0 1 2.45 3.82 12.67 12.67 0 0 1 1 4.89v15.57h10.23V23.07a22.95 22.95 0 0 0-6.42-15.93l-.37-.37a23.16 23.16 0 0 0-7.49-5A22.77 22.77 0 0 0 99.54 0Zm23.07 99.81V82.52h-10.23v17.29a12.67 12.67 0 0 1-1 4.89 13.08 13.08 0 0 1-2.8 4.17 12.8 12.8 0 0 1-9.06 3.78h-8.21v10.23h8.23a23 23 0 0 0 16.29-6.78 23.34 23.34 0 0 0 5-7.49 23 23 0 0 0 1.75-8.8Zm-99.54 23.07h12.6v-10.23h-12.6a12.8 12.8 0 0 1-9.07-3.78l-.26-.24a12.83 12.83 0 0 1-2.61-4.08 12.7 12.7 0 0 1-.91-4.74V82.52H0v17.29a22.64 22.64 0 0 0 1.67 8.57 22.86 22.86 0 0 0 4.79 7.38l.31.35a23.2 23.2 0 0 0 7.5 5 22.84 22.84 0 0 0 8.8 1.75Zm66.52-33.1H96v6.33h-6.41v-6.33Zm-12.36 0h6.44v6H70.8V83.47H77v-6.25h6.34V64.76h6.46v6.12h6.12v6.33H89.8v6.33H77.23v6.23ZM58.14 77.12h6.23v-6.33h-6v-6.33h6v-6.33h-6.13v6.33H51.8v-6.33h6.33v-18.8h6.43v18.79h6.23v6.33h6.13v-6.33h6.43v6.33h-6.12v6.33H70.8v12.46h-6.23v12.57h-6.43V77.12Zm31.35-19h6.43v6.33h-6.43v-6.33Zm-50.24 0h6.43v6.33h-6.43v-6.33Zm-12.57 0h6.43v6.33h-6.43v-6.33Zm31.46-31.35h6.43v6.33h-6.43v-6.33ZM26.58 70.88H51.8V96H26.58V70.88ZM32.71 77h13v12.91h-13V77Zm38-50.22h25.21v25.11H70.7V26.77Zm6.13 6.1h13v12.91h-13V32.87Zm-44 0h13v12.91h-13V32.87Z"
          style="fill-rule:evenodd" />
      </svg>
      <span>Scan QR Code</span>
    </button>
  </div>
</div>
