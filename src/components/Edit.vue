<script setup lang="ts">
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { onMounted } from 'vue'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

const props = defineProps({
  id: { type: String, required: true },
  code: { type: String, required: true },
  type: {type: String, default: 'javascript'}
})


const showEdit = () => {
  monaco.editor.create(document.getElementById(props.id), {
    value: props.code,
    language: props.type
  })
}

// onMounted(showEdit)

</script>

<template>
  <!-- <div :id="props.id" class="edit-wrap"></div> -->
  <highlightjs autodetect :code="props.code" />
</template>


<style scoped lang="scss">

.edit-wrap {
  width: 100%;
  height: 100vh;
}
</style>
