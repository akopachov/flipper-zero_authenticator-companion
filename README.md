# Flipper Authenticator Companion

[![GitHub release](https://img.shields.io/github/release/akopachov/flipper-zero_authenticator-companion?include_prereleases=&sort=semver&color=blue)](https://github.com/akopachov/flipper-zero_authenticator-companion/releases/)
[![License](https://img.shields.io/github/license/akopachov/flipper-zero_authenticator-companion
)](/LICENSE)
[![issues - flipper-zero_authenticator-companion](https://img.shields.io/github/issues/akopachov/flipper-zero_authenticator-companion)](https://github.com/akopachov/flipper-zero_authenticator-companion/issues)
![maintained - yes](https://img.shields.io/badge/maintained-yes-blue)
[![Known Vulnerabilities](https://snyk.io/test/github/akopachov/flipper-zero_authenticator-companion/badge.svg)](https://snyk.io/test/github/akopachov/flipper-zero_authenticator-companion)
![contributions - welcome](https://img.shields.io/badge/contributions-welcome-blue)


<a href=".github/screenshots/token-list.png">
  <img src=".github/screenshots/token-list.png" height="300px" />
</a>
<a href=".github/screenshots/add-token.png">
  <img src=".github/screenshots/add-token.png" height="300px" />
</a>
<a href=".github/screenshots/import-tokens.png">
  <img src=".github/screenshots/import-tokens.png" height="300px" />
</a>

## Description

Flipper Authenticator Companion is a companion application for [Flipper Authenticator](https://github.com/akopachov/flipper-zero_authenticator) software-based TOTP/HOTP authenticator for Flipper Zero device. This application allows to interact with Flipper Authenticator in a more user-friendly way.

## How get it

1. Go to [latest release](https://github.com/akopachov/flipper-zero_authenticator-companion/releases/latest)
2. Download appropriate file for your platform
3. Run it

**IMPORTANT NOTE:**

All the application binaries provided in the releases are unsigned and some anti-virus software may prevent running due to that. To verify file integrity you may check SHA256 checksum provided for every release. Executable files for all platforms are scanned by [Virustotal](https://virustotal.com/) for every release and scan results are available on the release page.

## Build

```console
pnpm config set node-linker hoisted --location project
pnpm install
pnpm build
```

## Development

```console
pnpm install
pnpm dev
```

## Want to say thank you?

* Buy me a coffee [here](https://ko-fi.com/akopachov) (No account needed, one-time)
* Become a patron at [Patreon](https://patreon.com/akopachov) (Account needed)
* [Z.Cash](https://z.cash/): `t1PCzJrd96RUfzjzhBERfXEFvSi7W6V86hM`
* [DOGE](https://dogecoin.com/): `DAa3nu1RCWwxZdAnGVga77bgxDFP1nhahj`
* [TON](https://ton.org/): `EQCSBzoTb1B7RhXnka5RegmdjHR3gQwRVgZHNPPqzjjvlW9T`
