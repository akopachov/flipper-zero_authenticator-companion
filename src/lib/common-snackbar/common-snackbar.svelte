<script lang="ts">
  import Snackbar, { Actions, Label } from '@smui/snackbar';
  import IconButton from '@smui/icon-button';
  import { GlobalCommonSnackbar } from '../../stores/global-common-snackbar';

  let snackbar: Snackbar;

  $: $GlobalCommonSnackbar.visible && snackbar.open();
</script>

<Snackbar bind:this={snackbar} timeoutMs={5000} class="snackbar-{$GlobalCommonSnackbar.type}">
  <Label>{$GlobalCommonSnackbar.text}</Label>
  <Actions>
    <IconButton class="material-icons" title="Dismiss">close</IconButton>
  </Actions>
</Snackbar>
