<template>
  <div id="window">
    <div id="app">
      <Html lang="ja">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>

      </Html>
    </div>
  </div>
</template>

<style scoped>
#window {
  width: 100%;
  height: 100%;
  background-image: url("./assets/images/background.jpg");
  object-fit: cover;
  background-repeat: no-repeat;
  background-size: cover;
}

#app {
  max-width: 500px;
  height: 100vh;
  margin: auto 0 auto auto;
}
</style>