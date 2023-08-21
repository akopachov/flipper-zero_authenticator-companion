<script lang="ts">
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import { GlobalCommonDialog } from '../../stores/global-common-dialog';

  function closeHandler(e: CustomEvent<{ action: string }>) {
    GlobalCommonDialog._handleDialogResult(e.detail.action);
  }
</script>

<Dialog on:SMUIDialog:closed={closeHandler} open={$GlobalCommonDialog.visible}>
  <Title id="event-title">{$GlobalCommonDialog.title}</Title>
  <Content id="event-content">{$GlobalCommonDialog.content}</Content>
  <Actions>
    {#each $GlobalCommonDialog.buttons as button}
      <Button action={button.action}>
        <Label>{button.text}</Label>
      </Button>
    {/each}
  </Actions>
</Dialog>
