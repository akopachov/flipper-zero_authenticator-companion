<script lang="ts">
  import log from 'electron-log';
  import { FileDropzone } from '@skeletonlabs/skeleton';
  import { CommonToastType, GlobalCommonToast } from '$stores/global-common-toast';
  import type { TokenInfo } from '$models/token-info';
  import { goto } from '$app/navigation';
  import { dataToQueryString } from '$lib/query-string-utils';
  import { importFromBitwarden } from '$lib/import';

  GlobalCommonToast.initialize();

  let files: FileList;

  async function processFiles() {
    if (files.length <= 0) return;
    let parsedTokens: TokenInfo[] = [];
    let errorsFound = false;
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        try {
          const jsonContent = JSON.parse(await file.text());
          parsedTokens.push(...importFromBitwarden(jsonContent));
        } catch (e) {
          errorsFound = true;
          log.error(e);
          GlobalCommonToast.show(`Unable to import tokens from file ${file.path}`, CommonToastType.Error);
        }
      }
    }

    if (!errorsFound) {
      if (parsedTokens.length > 0) {
        const serializedParsedTokens = dataToQueryString(parsedTokens);
        await goto(`/import/confirm?data=${serializedParsedTokens}`);
      } else {
        GlobalCommonToast.show('No valid tokens found', CommonToastType.Warning);
      }
    }
  }
</script>

<div class="p-4">
  <h4 class="h4">Import from Bitwarden</h4>
  <div class="mt-5 mb-5">
    <ol class="list-decimal ml-4">
      <li>
        Use <a class="anchor" target="_blank" href="external-https://bitwarden.com/help/export-your-data/">
          official instruction from Bitwarden
        </a>
        to export data to
        <strong>JSON file (unencrypted)</strong>
      </li>
      <li>
        Save and <strong>transfer the exported JSON file to this machine in the safest way possible</strong>
      </li>
      <li>Drag & drop or select the exported JSON file in the area below</li>
    </ol>
  </div>
  <div class="flex justify-center w-full">
    <FileDropzone name="files" bind:files on:change={processFiles} accept=".json">
      <svelte:fragment slot="lead">
        <div class="flex justify-center">
          <svg
            class="w-9 h-9"
            stroke-width="1.5"
            fill="currentColor"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M515.5 366.1h230.6L461 80.8v230.7c0 30 24.5 54.6 54.5 54.6zM882 681.7l-98.8-98.8c-16.3-16.3-43.1-16.3-59.4 0L625 681.7c-16.3 16.3-16.3 43.1 0 59.4 16.3 16.3 43.1 16.3 59.4 0l27.1-27.1v193.9c0 23.1 18.9 42 42 42s42-18.9 42-42V714l27.1 27.1c16.3 16.3 43.1 16.3 59.4 0 16.4-16.4 16.4-43.1 0-59.4z" />
            <path
              d="M593.9 771.5c-31.2-31.2-31.2-82.4 0-113.6l91.2-91.2c3.1-4.8 6.7-9.3 10.8-13.5 14-14 31.9-21.7 50.3-23.1v-109H507.9c-56.4 0-102.1-45.7-102.1-102.1V80.8H190.3c-27.6 0-50.2 22.6-50.2 50.2v723c0 27.6 22.6 50.2 50.2 50.2h483V791.7c-27.3 7.9-58 1.2-79.4-20.2z" />
          </svg>
        </div>
      </svelte:fragment>
      <svelte:fragment slot="message">
        <strong>Upload a file</strong>
        or drag and drop
      </svelte:fragment>
      <svelte:fragment slot="meta">Only JSON allowed</svelte:fragment>
    </FileDropzone>
  </div>
</div>
