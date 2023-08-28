<script lang="ts">
  import log from 'electron-log';
  import SegmentedButton, { Segment, Label } from '@smui/segmented-button';
  import IconButton, { Icon as IconButtonIcon } from '@smui/icon-button';
  import Button, { Label as ButtonLabel } from '@smui/button';
  import Switch from '@smui/switch';
  import FormField from '@smui/form-field';
  import Paper, { Title, Content } from '@smui/paper';
  import Select, { Option } from '@smui/select';
  import Tooltip, { Wrapper } from '@smui/tooltip';
  import {
    DeviceAppSettings,
    DeviceAppNotification,
    DeviceAppAutomation,
    DeviceAppAutomationKeyboardLayout,
  } from '../../models/device-app-settings';
  import { getOffsets, type UTCOffsetInfo } from 'utc-offsets';
  import { AvailableTimeProviders, type TimeProvider } from '$lib/time-providers';
  import { SharedTotpAppClient } from '$stores/totp-shared-client';
  import { onDestroy, onMount } from 'svelte';
  import { CommonSnackbarType, GlobalCommonSnackbar } from '$stores/global-common-snackbar';
  import { slide } from 'svelte/transition';
  import { GlobalAppSettings } from '$stores/global-app-settings';
  import { AvailableTimezoneProviders, type TimezoneProvider } from '$lib/timezone-providers';
  import { LocalTimezoneProvider } from '$lib/timezone-providers/local-timezone-provider';
  import { CloudTimezoneProvider } from '$lib/timezone-providers/cloud-timezone-provider';

  const abortController = new AbortController();
  let deviceAppSettings: DeviceAppSettings;
  let availableUtcOffsets: UTCOffsetInfo[] = getOffsets();
  let selectedTimeProvider: TimeProvider = AvailableTimeProviders[GlobalAppSettings.dateTime.provider];
  let selectedTimezoneProvider: TimezoneProvider = AvailableTimezoneProviders[GlobalAppSettings.timezone.provider];
  let availableKeyboardLayouts: DeviceAppAutomationKeyboardLayout[] = Object.values(DeviceAppAutomationKeyboardLayout);

  async function loadSettings() {
    deviceAppSettings = await SharedTotpAppClient.getAppSettings(abortController.signal);
  }

  async function saveSettings() {
    try {
      GlobalAppSettings.dateTime.provider = AvailableTimeProviders.indexOf(selectedTimeProvider);
      GlobalAppSettings.timezone.provider = AvailableTimezoneProviders.indexOf(selectedTimezoneProvider);
      GlobalAppSettings.commit();
      await SharedTotpAppClient.setDeviceDatetime(
        await selectedTimeProvider.getCurrentTime(abortController.signal),
        abortController.signal,
      );
      await SharedTotpAppClient.updateAppSettings(deviceAppSettings, abortController.signal);
      GlobalCommonSnackbar.show('Settings have been successfully updated', CommonSnackbarType.Success);
    } catch (e) {
      GlobalCommonSnackbar.show('An error occurred during updating settings', CommonSnackbarType.Error);
      log.error(e);
    }
  }

  async function syncTimezoneFromLocal() {
    deviceAppSettings.timezoneOffset = await new LocalTimezoneProvider().getCurrentTimezoneOffset();
  }

  async function syncTimezoneFromCloud() {
    deviceAppSettings.timezoneOffset = await new CloudTimezoneProvider().getCurrentTimezoneOffset();
  }

  onMount(() => loadSettings());
  onDestroy(() => {
    abortController.abort();
    GlobalAppSettings.revert();
  });
</script>

{#if deviceAppSettings}
  <div class="container">
    <form class="app-settings-form" on:submit={saveSettings}>
      <Paper variant="outlined" class="section">
        <Title>Date and time</Title>
        <Content>
          <label class="time-provider-label" for="timeProvider">Sync device time with</label>
          <SegmentedButton
            id="timeProvider"
            segments={AvailableTimeProviders}
            let:segment
            singleSelect
            bind:selected={selectedTimeProvider}>
            <Segment {segment} type="button">
              <Label>{segment.name}</Label>
            </Segment>
          </SegmentedButton>
          <div>
            <FormField class="sync-at-start">
              <Switch bind:checked={GlobalAppSettings.dateTime.syncAtStartup} />
              <span slot="label">Sync at startup</span>
            </FormField>
          </div>
        </Content>
      </Paper>
      <Paper variant="outlined" class="section">
        <Title>Timezone</Title>
        <Content>
          <div class="timezone-container">
            <div class="timezone-select">
              <Select
                class="input-element"
                variant="outlined"
                bind:value={deviceAppSettings.timezoneOffset}
                label="UTC offset"
                key={value => `${value}`}>
                {#each availableUtcOffsets as utcOffset}
                  <Option value={utcOffset.minutes / 60}>{utcOffset.offset}</Option>
                {/each}
              </Select>
              <Wrapper>
                <IconButton class="sync-from-local" on:click={syncTimezoneFromLocal} type="button">
                  <IconButtonIcon class="material-icons">sync</IconButtonIcon>
                </IconButton>
                <Tooltip>Get from local machine</Tooltip>
              </Wrapper>
              <Wrapper>
                <IconButton class="sync-from-local" on:click={syncTimezoneFromCloud} type="button">
                  <IconButtonIcon class="material-icons">cloud_sync</IconButtonIcon>
                </IconButton>
                <Tooltip>Get from cloud</Tooltip>
              </Wrapper>
            </div>
            <div>
              <FormField class="sync-at-start">
                <Switch bind:checked={GlobalAppSettings.timezone.syncAtStartup} />
                <span slot="label">Sync at startup</span>
              </FormField>
              {#if GlobalAppSettings.timezone.syncAtStartup}
                <div>
                  <SegmentedButton
                    segments={AvailableTimezoneProviders}
                    let:segment
                    singleSelect
                    bind:selected={selectedTimezoneProvider}>
                    <Segment {segment} type="button">
                      <Label>{segment.name}</Label>
                    </Segment>
                  </SegmentedButton>
                </div>
              {/if}
            </div>
          </div>
        </Content>
      </Paper>
      <Paper variant="outlined" class="section">
        <Title>Notification</Title>
        <Content>
          <div>
            <FormField>
              <Switch bind:group={deviceAppSettings.notification} value={DeviceAppNotification.Sound} />
              <span slot="label">Sound</span>
            </FormField>
          </div>
          <div>
            <FormField>
              <Switch bind:group={deviceAppSettings.notification} value={DeviceAppNotification.Vibro} />
              <span slot="label">Vibro</span>
            </FormField>
          </div>
        </Content>
      </Paper>
      <Paper variant="outlined" class="section">
        <Title>Automation</Title>
        <Content>
          <div>
            <FormField>
              <Switch bind:group={deviceAppSettings.automation} value={DeviceAppAutomation.USB} />
              <span slot="label">USB</span>
            </FormField>
          </div>
          <div>
            <FormField>
              <Switch bind:group={deviceAppSettings.automation} value={DeviceAppAutomation.Bluetooth} />
              <span slot="label">Bluetooth</span>
            </FormField>
          </div>
          {#if deviceAppSettings.automation.length > 0}
            <div class="kb-layout-container" transition:slide>
              <label class="kb-layout-label" for="kbLayout">Keyboard layout</label>
              <SegmentedButton
                id="kbLayout"
                segments={availableKeyboardLayouts}
                let:segment
                singleSelect
                bind:selected={deviceAppSettings.automationKeyboardLayout}>
                <Segment {segment} type="button">
                  <Label>{segment}</Label>
                </Segment>
              </SegmentedButton>
            </div>
          {/if}
        </Content>
      </Paper>
      <div class="action-controls">
        <Button class="save" variant="unelevated" type="submit">
          <ButtonLabel>Save</ButtonLabel>
        </Button>
      </div>
    </form>
  </div>
{/if}

<style lang="scss">
  .container {
    display: flex;
    height: max-content;
    min-height: 100%;

    .app-settings-form {
      flex-basis: 100%;
      padding: 20px;

      :global(.section) {
        margin-bottom: 20px;
      }

      .time-provider-label {
        display: block;
      }

      :global(.sync-at-start) {
        margin: 10px 0 0 0;
      }

      .timezone-container {
        .timezone-select {
          display: flex;
          align-items: center;
        }

        :global(.sync-at-start) {
          margin: 10px 0;
        }
      }

      .kb-layout-container {
        margin-top: 20px;

        .kb-layout-label {
          display: block;
        }
      }

      .action-controls {
        display: flex;
        justify-content: center;
      }
    }
  }
</style>
