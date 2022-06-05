<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Nav from './components/Nav.vue'
import Main from './components/Main.vue'
</script>

<template>
  <div class="main-page">
    <Nav />
    <Main></Main>
  </div>
</template>

<style >
#app {}

.main-page {
  width: 100vw;
}
</style>
