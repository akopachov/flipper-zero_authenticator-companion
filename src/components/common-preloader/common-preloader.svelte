<script lang="ts">
  import { GlobalPreloader } from '../../stores/global-preloader';
  import { fade } from 'svelte/transition';
</script>

{#if $GlobalPreloader.visible}
  <div
    out:fade={{ duration: 300 }}
    class="fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center flex-col backdrop-blur-md bg-surface-50 dark:bg-surface-600 !bg-opacity-50">
    <span class="loading bg-primary-500"></span>
    <h3 class="h3 text-center mt-3 text-current">{$GlobalPreloader.description}</h3>
  </div>
{/if}

<style>
  .loading {
    pointer-events: none;
    display: inline-block;
    aspect-ratio: 2/1;
    mask-size: 100%;
    mask-repeat: no-repeat;
    mask-position: center;
    mask-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHhtbG5zOnhsaW5rPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJyBzdHlsZT0nc2hhcGUtcmVuZGVyaW5nOiBhdXRvOycgd2lkdGg9JzIwMHB4JyBoZWlnaHQ9JzIwMHB4JyB2aWV3Qm94PScwIDAgMTAwIDEwMCcgcHJlc2VydmVBc3BlY3RSYXRpbz0neE1pZFlNaWQnPjxwYXRoIGZpbGw9J25vbmUnIHN0cm9rZT0nIzBhMGEwYScgc3Ryb2tlLXdpZHRoPScxMCcgc3Ryb2tlLWRhc2hhcnJheT0nMjA1LjI3MTE0MjU3ODEyNSA1MS4zMTc3ODU2NDQ1MzEyNTYnIGQ9J00yNC4zIDMwQzExLjQgMzAgNSA0My4zIDUgNTBzNi40IDIwIDE5LjMgMjBjMTkuMyAwIDMyLjEtNDAgNTEuNC00MCBDODguNiAzMCA5NSA0My4zIDk1IDUwcy02LjQgMjAtMTkuMyAyMEM1Ni40IDcwIDQzLjYgMzAgMjQuMyAzMHonIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3R5bGU9J3RyYW5zZm9ybTpzY2FsZSgwLjgpO3RyYW5zZm9ybS1vcmlnaW46NTBweCA1MHB4Jz48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSdzdHJva2UtZGFzaG9mZnNldCcgcmVwZWF0Q291bnQ9J2luZGVmaW5pdGUnIGR1cj0nMnMnIGtleVRpbWVzPScwOzEnIHZhbHVlcz0nMDsyNTYuNTg4OTI4MjIyNjU2MjUnPjwvYW5pbWF0ZT48L3BhdGg+PC9zdmc+);
    width: 14rem;
  }
</style>
