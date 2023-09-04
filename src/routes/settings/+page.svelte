<script lang="ts">
  import log from 'electron-log';
  import { DeviceAppSettings, DeviceAppAutomationKeyboardLayout } from '../../models/device-app-settings';
  import { getOffsets, type UTCOffsetInfo } from 'utc-offsets';
  import { AvailableTimeProviders } from '$lib/time-providers';
  import { SharedTotpAppClient } from '$stores/totp-shared-client';
  import { onDestroy, onMount } from 'svelte';
  import { getAppSettings } from '$stores/app-settings';
  import { AvailableTimezoneProviders } from '$lib/timezone-providers';
  import { CommonToastType, GlobalCommonToast } from '$stores/global-common-toast';
  import { RadioGroup, RadioItem, SlideToggle } from '@skeletonlabs/skeleton';
  import { FromConfigTimezoneProvider } from '$lib/timezone-providers/from-config-timezone-provider';
  import { slide } from 'svelte/transition';

  GlobalCommonToast.initialize();

  const abortController = new AbortController();
  let deviceAppSettings: DeviceAppSettings;
  const appSettings = getAppSettings();
  let availableUtcOffsets: UTCOffsetInfo[] = getOffsets();
  let availableKeyboardLayouts: DeviceAppAutomationKeyboardLayout[] = Object.values(DeviceAppAutomationKeyboardLayout);

  async function loadSettings() {
    deviceAppSettings = await SharedTotpAppClient.getAppSettings(abortController.signal);
  }

  async function saveSettings() {
    try {
      appSettings.commit();
      await SharedTotpAppClient.setDeviceDatetime(
        await AvailableTimeProviders[appSettings.dateTime.provider].getCurrentTime(abortController.signal),
        abortController.signal,
      );
      deviceAppSettings.timezoneOffset =
        await AvailableTimezoneProviders[appSettings.timezone.provider].getCurrentTimezoneOffset();
      await SharedTotpAppClient.updateAppSettings(deviceAppSettings, abortController.signal);
      GlobalCommonToast.show('Settings have been successfully updated', CommonToastType.Success);
    } catch (e) {
      GlobalCommonToast.show('An error occurred during updating settings', CommonToastType.Error);
      log.error(e);
    }
  }

  onMount(() => loadSettings());
  onDestroy(() => {
    abortController.abort();
    appSettings.revert();
  });
</script>

{#if deviceAppSettings}
  <div class="flex h-max min-h-full">
    <form class="w-full p-4" on:submit={saveSettings}>
      <div class="mb-5">
        <h3 class="h3">Date and time</h3>
        <label class="label mb-3" for="timeProvider">
          <span class="block">Sync device time with</span>
          <RadioGroup id="timeProvider" active="variant-filled-primary" hover="hover:variant-soft-primary">
            {#each AvailableTimeProviders as provider, index}
              <RadioItem name="Time provider" bind:group={appSettings.dateTime.provider} value={index}>
                {provider.name}
              </RadioItem>
            {/each}
          </RadioGroup>
        </label>
        <SlideToggle
          name="timeProvider-syncAtStartup-label"
          size="sm"
          bind:checked={appSettings.dateTime.syncAtStartup}>
          Sync at startup
        </SlideToggle>
      </div>
      <div class="mb-5">
        <h3 class="h3">Timezone</h3>
        <label class="label mb-3" for="timezoneProvider">
          <span class="block">Sync timezone with</span>
          <RadioGroup id="timezoneProvider" active="variant-filled-primary" hover="hover:variant-soft-primary">
            {#each AvailableTimezoneProviders as provider, index}
              <RadioItem name="Timezone provider" bind:group={appSettings.timezone.provider} value={index}>
                {provider.name}
              </RadioItem>
            {/each}
          </RadioGroup>
        </label>
        {#if AvailableTimezoneProviders[appSettings.timezone.provider] instanceof FromConfigTimezoneProvider}
          <label class="label mb-3 max-w-xs" transition:slide={{ duration: 200 }}>
            <span class="block">Timezone UTC offset</span>
            <select class="select" bind:value={appSettings.timezone.manualOffset}>
              {#each availableUtcOffsets as utcOffset}
                <option value={utcOffset.minutes / 60}>{utcOffset.offset}</option>
              {/each}
            </select>
          </label>
        {/if}
        <SlideToggle
          name="timezoneProvider-syncAtStartup-label"
          size="sm"
          bind:checked={appSettings.timezone.syncAtStartup}>
          Sync at startup
        </SlideToggle>
      </div>
      <div class="mb-5">
        <h3 class="h3">Notification</h3>
        <div class="block mb-4 mt-2">
          <SlideToggle name="notification-sound-label" size="sm" bind:checked={deviceAppSettings.notification.sound}>
            Sound
          </SlideToggle>
        </div>
        <div class="block">
          <SlideToggle name="notification-vibro-label" size="sm" bind:checked={deviceAppSettings.notification.vibro}>
            Vibro
          </SlideToggle>
        </div>
      </div>
      <div class="mb-5">
        <h3 class="h3">Automation</h3>
        <div class="block mb-4 mt-2">
          <SlideToggle name="automation-usb-label" size="sm" bind:checked={deviceAppSettings.automation.usb}>
            USB
          </SlideToggle>
        </div>
        <div class="block">
          <SlideToggle name="automation-usb-label" size="sm" bind:checked={deviceAppSettings.automation.bluetooth}>
            Bluetooth
          </SlideToggle>
        </div>
        {#if deviceAppSettings.automation.size > 0}
          <label class="label mb-3 mt-3" for="automationKbLayout">
            <span class="block">Keyboard layout</span>
            <RadioGroup id="automationKbLayout" active="variant-filled-primary" hover="hover:variant-soft-primary">
              {#each availableKeyboardLayouts as layout}
                <RadioItem
                  class="uppercase"
                  name="Keyboard layout"
                  bind:group={deviceAppSettings.automationKeyboardLayout}
                  value={layout}>
                  {layout}
                </RadioItem>
              {/each}
            </RadioGroup>
          </label>
        {/if}
      </div>
      <div class="flex justify-center">
        <button type="submit" class="btn variant-filled-primary ml-auto w-20 -mr-20">Save</button>
        <a href="/" type="reset" class="btn variant-ghost ml-auto">Cancel</a>
      </div>
    </form>
  </div>
{/if}
