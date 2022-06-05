<script setup lang="ts">
import { ref } from 'vue'
import {
  Document,
  Menu as IconMenu,
  Setting,
} from '@element-plus/icons-vue'


const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<template>

  <el-menu active-text-color="#ffd04b" background-color="#545c64" default-active="2" mode="horizontal" text-color="#fff" @open="handleOpen" @close="handleClose">
    <el-menu-item index="2">
      <el-icon>
        <icon-menu />
      </el-icon>
      <span>基础功能</span>
    </el-menu-item>
    <el-menu-item index="3">
      <el-icon>
        <document />
      </el-icon>
      <span>TODO</span>
    </el-menu-item>
    <el-menu-item index="4">
      <el-icon>
        <setting />
      </el-icon>
      <span>github 地址</span>
    </el-menu-item>
  </el-menu>
</template>


<style scoped lang="scss">
</style>
