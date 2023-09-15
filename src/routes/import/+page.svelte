<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton';
</script>

<div class="flex h-max min-h-full">
  <nav class="list-nav flex mx-auto justify-center flex-col w-full max-w-fit">
    <ul>
      <li>
        <a href="/import/google" class="!rounded-xl !p-2">
          <Avatar src="/authenticator-icons/google.png" width="w-12" rounded="rounded-xl" />
          <span>Google Authenticator</span>
        </a>
      </li>
      <li>
        <a href="/import/aegis" class="!rounded-xl !p-2">
          <Avatar src="/authenticator-icons/aegis.png" width="w-12" rounded="rounded-xl" />
          <span>Aegis Authenticator</span>
        </a>
      </li>
      <li>
        <a href="/import/freeotpplus" class="!rounded-xl !p-2">
          <Avatar src="/authenticator-icons/freeotpplus.png" width="w-12" rounded="rounded-xl" />
          <span class="pr-2">FreeOTP+ Authenticator</span>
        </a>
      </li>
      <li>
        <a href="/import/2fas" class="!rounded-xl !p-2">
          <Avatar src="/authenticator-icons/2fas.png" width="w-12" rounded="rounded-xl" />
          <span>2FAS Authenticator</span>
        </a>
      </li>
      <li>
        <a href="/import/uri-list" class="!rounded-xl !p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-12 h-12">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <span>URI list</span>
        </a>
      </li>
    </ul>
  </nav>
</div>
