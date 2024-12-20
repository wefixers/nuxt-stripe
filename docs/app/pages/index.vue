<script setup lang="ts">
const { data: page } = await useAsyncData('index', () => queryContent('/').findOne())

definePageMeta({
  colorMode: 'dark',
})

useSeoMeta({
  title: page.value.title,
  ogTitle: page.value.title,
  description: page.value.description,
  ogDescription: page.value.description,
  ogImage: 'https://nuxt-stripe.fixers.dev/social-card.png',
  twitterImage: 'https://nuxt-stripe.fixers.dev/social-card.png',
})

defineOgImage({
  component: 'Docs',
  title: page.value.title,
  description: page.value.description,
})

const source = ref('pnpm i -D @fixers/nuxt-stripe')
const { copy } = useCopyToClipboard()
</script>

<template>
  <div>
    <span class="gradient" />
    <ULandingHero
      v-if="page.hero"
      v-bind="page.hero"
    >
      <Illustration class="hidden lg:block h-64 w-full" />

      <template #title>
        <MDC :value="page.hero.title" />
      </template>

      <template #links>
        <UButton
          to="/get-started/installation"
          icon="i-heroicons-rocket-launch"
          size="xl"
        >
          Get started
        </UButton>
        <UInput
          aria-label="Copy code to get started"
          :model-value="source"
          name="get-started"
          disabled
          autocomplete="off"
          size="xl"
          :ui="{ base: 'disabled:cursor-default', icon: { trailing: { pointer: '' } } }"
        >
          <template #leading>
            <UIcon name="i-heroicons-chevron-right" />
          </template>
          <template #trailing>
            <UButton
              aria-label="Copy Code"
              color="gray"
              variant="ghost"
              :padded="false"
              icon="i-heroicons-clipboard-document"
              @click="copy(source, {
                title: '🎉 Here you go!',
                description: 'You\'ve copied the code to install Nuxt Stripe, now head over the doc to get started!',
              })"
            />
          </template>
        </UInput>
      </template>
    </ULandingHero>

    <ULandingSection
      :title="page.features.title"
      :links="page.features.links"
    >
      <UPageGrid>
        <ULandingCard
          v-for="(item, index) of page.features.items"
          :key="index"
          v-bind="item"
        />
      </UPageGrid>
    </ULandingSection>
  </div>
</template>

<style scoped>
.gradient {
  position: fixed;
  top: 25vh;
  width: 100%;
  height: 30vh;
  background: radial-gradient(50% 50% at 50% 50%, #00DC82 0%, rgba(0, 220, 130, 0) 100%);
  filter: blur(180px);
  opacity: 0.6;
  z-index: -1;
}
</style>
