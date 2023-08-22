<script lang="ts">
  import SegmentedButton, { Segment, Label } from '@smui/segmented-button';
  import IconButton, { Icon as IconButtonIcon } from '@smui/icon-button';
  import Button, { Label as ButtonLabel } from '@smui/button';
  import Switch from '@smui/switch';
  import FormField from '@smui/form-field';
  import Paper, { Title, Content } from '@smui/paper';
  import Select, { Option } from '@smui/select';
  import { DeviceAppSettings, DeviceAppNotification, DeviceAppAutomation } from '../../models/device-app-settings';
  import { getOffsets, type UTCOffsetInfo } from 'utc-offsets';
  import { type TimeProvider, LocalTimeProvider, CloudTimeProvider } from '$lib/time-providers';

  let appSettings: DeviceAppSettings = new DeviceAppSettings();
  let availableUtcOffsets: UTCOffsetInfo[] = getOffsets();
  let availableTimeProviders: TimeProvider[] = [new LocalTimeProvider(), new CloudTimeProvider()];
  let selectedTimeProvider: TimeProvider = availableTimeProviders[0];

  async function onCancelClicked() {}
</script>

<div class="container">
  <form class="app-settings-form">
    <Paper variant="outlined" class="section">
      <Title>Date and time</Title>
      <Content>
        <label class="time-provider-label" for="timeProvider">Sync device time with</label>
        <SegmentedButton
          id="timeProvider"
          segments={availableTimeProviders}
          let:segment
          singleSelect
          bind:selected={selectedTimeProvider}>
          <Segment {segment}>
            <Label>{segment.name}</Label>
          </Segment>
        </SegmentedButton>
      </Content>
    </Paper>
    <Paper variant="outlined" class="section">
      <Title>Timezone</Title>
      <Content>
        <div class="timezone-container">
          <Select
            class="input-element"
            variant="outlined"
            bind:value={appSettings.timezoneOffset}
            label="UTC offset"
            key={value => `${value}`}>
            {#each availableUtcOffsets as utcOffset}
              <Option value={utcOffset.minutes / 60}>{utcOffset.offset}</Option>
            {/each}
          </Select>
          <IconButton class="sync-from-local" color="primary">
            <IconButtonIcon class="material-icons">sync</IconButtonIcon>
          </IconButton>
          <IconButton class="sync-from-local">
            <IconButtonIcon class="material-icons">cloud_sync</IconButtonIcon>
          </IconButton>
        </div>
      </Content>
    </Paper>
    <Paper variant="outlined" class="section">
      <Title>Notification</Title>
      <Content>
        <div>
          <FormField>
            <Switch bind:group={appSettings.notification} value={DeviceAppNotification.Sound} />
            <span slot="label">Sound</span>
          </FormField>
        </div>
        <div>
          <FormField>
            <Switch bind:group={appSettings.notification} value={DeviceAppNotification.Vibro} />
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
            <Switch bind:group={appSettings.automation} value={DeviceAppAutomation.USB} />
            <span slot="label">USB</span>
          </FormField>
        </div>
        <div>
          <FormField>
            <Switch bind:group={appSettings.automation} value={DeviceAppAutomation.Bluetooth} />
            <span slot="label">Bluetooth</span>
          </FormField>
        </div>
      </Content>
    </Paper>
    <div class="action-controls">
      <Button class="save" variant="unelevated" type="submit">
        <ButtonLabel>Save</ButtonLabel>
      </Button>
      <Button class="cancel" type="reset" on:click={onCancelClicked}>
        <ButtonLabel>Cancel</ButtonLabel>
      </Button>
    </div>
  </form>
</div>

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

      .timezone-container {
        display: flex;
        align-items: center;
      }

      .action-controls {
        display: flex;
        justify-content: center;

        :global(.save) {
          margin-left: auto;
          margin-right: -70px;
        }

        :global(.cancel) {
          margin-left: auto;
        }
      }
    }
  }
</style>
