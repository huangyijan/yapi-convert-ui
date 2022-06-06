
<script setup lang="ts">
import { Right } from '@element-plus/icons-vue'
</script>
<template>
  <el-col :span="1" class="arrow-wrap">
    <el-icon class="arrow-right" :size="32" v-for="num in 12">
      <Right />
    </el-icon>
  </el-col>
</template>


<style scoped lang="scss">
@keyframes rightMove {
  0% {
      left: -15px;
    }
  
    100% {
      left: 15px;
      color: #000;
    }
}

.arrow-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;

  .arrow-right {
    margin: 10px 0;
    color: #ccc;
    animation: rightMove 2s ease infinite;
  }
}
</style>
