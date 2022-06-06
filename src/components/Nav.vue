<script setup lang="ts">
import { ref } from 'vue'
import {
  Document,
  Menu as IconMenu,
  List,
} from '@element-plus/icons-vue'


const handleOpen = (index: string) => {
  const pageIndex = Number(index)
  if(pageIndex === 1) return
  let codeUrl = 'http://github.miguatech.com/huangyijian/aomi-yapi-convert'
   if(pageIndex === 2)   codeUrl += '/blob/master/.todo'
   window.open(codeUrl, 'blank')
}
</script>

<template>

  <el-menu active-text-color="#ffd04b" @select="handleOpen" background-color="#545c64" default-active="1" mode="horizontal" text-color="#fff" class="top-menu">
    <el-menu-item index="1">
      <el-icon>
        <icon-menu />
      </el-icon>
      <span>基础功能</span>
    </el-menu-item>
    <el-menu-item index="2">
      <el-icon>
        <List />
      </el-icon>
      <span>TODO</span>
    </el-menu-item>
    <el-menu-item index="3">
      <el-icon>
        <document />

      </el-icon>
      <span>代码地址</span>
    </el-menu-item>
  </el-menu>
</template>


<style scoped lang="scss">
.top-menu {
  width: 100vw;
}
</style>
