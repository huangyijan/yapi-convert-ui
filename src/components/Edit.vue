<script setup lang="ts">

const props = defineProps({
  id: { type: String, required: true },
  code: { type: String, required: true },
  type: { type: String, default: 'javascript' }
})



</script>

<template>
  <div class="edit-container">
    <highlightjs autodetect :code="props.code" class="code-read" />
  </div>
</template>


<style scoped lang="scss">


.edit-container {
  .code-read {
    width: 100%;
    position: relative;
    overflow: hidden;
    margin: 0;
  }
    .edit-wrap {
      width: 100%;
      min-height: 800px;
    }
}
</style>
