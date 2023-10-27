<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton';
</script>

<div class="flex h-max min-h-full">
  <div class="flex mx-auto justify-center flex-col w-full max-w-fit">
    <h4 class="h4 mb-5 text-center">Select an app to import tokens from</h4>
    <nav class="list-nav flex-col mx-auto">
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
            <div class="w-12 h-12 rounded-xl bg-white flex justify-center items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xml:space="preserve"
                class="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 487.3 487.3">
                <path
                  d="M487.2 69.7c0 12.9-10.5 23.4-23.4 23.4h-322c-12.9 0-23.4-10.5-23.4-23.4s10.5-23.4 23.4-23.4h322.1c12.9.1 23.3 10.5 23.3 23.4zm-23.3 92.6H141.8c-12.9 0-23.4 10.5-23.4 23.4s10.5 23.4 23.4 23.4h322.1c12.9 0 23.4-10.5 23.4-23.4-.1-12.9-10.5-23.4-23.4-23.4zm0 116H141.8c-12.9 0-23.4 10.5-23.4 23.4s10.5 23.4 23.4 23.4h322.1c12.9 0 23.4-10.5 23.4-23.4-.1-12.9-10.5-23.4-23.4-23.4zm0 116H141.8c-12.9 0-23.4 10.5-23.4 23.4s10.5 23.4 23.4 23.4h322.1c12.9 0 23.4-10.5 23.4-23.4-.1-12.9-10.5-23.4-23.4-23.4zM38.9 30.8C17.4 30.8 0 48.2 0 69.7s17.4 39 38.9 39 38.9-17.5 38.9-39-17.4-38.9-38.9-38.9zm0 116C17.4 146.8 0 164.2 0 185.7s17.4 38.9 38.9 38.9 38.9-17.4 38.9-38.9-17.4-38.9-38.9-38.9zm0 116C17.4 262.8 0 280.2 0 301.7s17.4 38.9 38.9 38.9 38.9-17.4 38.9-38.9-17.4-38.9-38.9-38.9zm0 115.9C17.4 378.7 0 396.1 0 417.6s17.4 38.9 38.9 38.9 38.9-17.4 38.9-38.9c0-21.4-17.4-38.9-38.9-38.9z" />
              </svg>
            </div>
            <span>URI list</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</div>
