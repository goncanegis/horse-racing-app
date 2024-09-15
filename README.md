# Horse Racing Simulator

## Setup

Make sure to install the dependencies:

```bash
# pnpm
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# pnpm
pnpm run dev

```

## Production

Build the application for production:

```bash
# pnpm
pnpm run generate
```

Locally preview production build:

```bash

# pnpm
pnpm run preview

```

## Project Structure

#### <u>Data</u>

- <b>data/constants.ts</b> - Preconfigured constants values such as horse names, colors, number of horse list, etc.

#### <u>Common functions</u>

- <b>data/utils.ts</b> - Utility functions that will be used to generate race schedules and unique values for the races.

- <b>data/utils.test.ts</b> - Unit tests for the utility functions.

#### <u>State management</u>

- <b>store/index.ts</b> - Centralized state management using Vuex

- <b>plugins/store.ts</b> - Plugin to initialize the store and use it globally

- <b>store/index.test.ts</b> - Unit tests for the store

#### <u>SEO and meta</u>

- <b>App SEO and meta tags</b> are configured in app.vue useHead composable.

#### <u>Configurations</u>

- <b>nuxt.config.ts</b> - CSR, color mode and other configurations are set here.

- <b>app.config.ts</b> - NuxtUI configurations are set here.

- <b>vitest.config.ts</b> - Vitest configurations are set here.

<br />
<br />
---
<br />
<br />

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.
