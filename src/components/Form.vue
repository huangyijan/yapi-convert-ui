<script setup lang="ts">
defineProps({
  form: { type: Object, required: true },
  list: { type: Object, required: true }
})
const emit = defineEmits<{
  (e: 'formUpdate'): void
}>()

const formUpdate = () => {
  emit('formUpdate')
}
</script>

<template>
  <el-form :model="form" label-width="120px">
    <el-form-item label="yapi token">
      <el-input v-model="form.token" type="textarea" :rows="4" />
    </el-form-item>
    <el-form-item label="yapi userId">
      <el-input v-model="form.userId" />
    </el-form-item>
    <el-form-item label="yapi 地址">
      <el-input v-model="form.yapiURL" />
    </el-form-item>
    <el-form-item label="axios 引入目录">
      <el-input v-model="form.axiosFrom" @blur="formUpdate" placeholder="默认是: import { fetch } from 'axios'" />
    </el-form-item>
    <el-form-item label="请求名">
      <el-input v-model="form.axiosName" @blur="formUpdate" placeholder="默认是: fetch" />
    </el-form-item>
    <el-form-item label="服务端类型提示">
      <el-switch v-model="form.isNeedType" active-color="#13ce66" inactive-color="#ff4949" @change="formUpdate" />
    </el-form-item>
    <el-form-item label="axios参数提示">
      <el-switch v-model="form.isNeedAxiosType" active-color="#13ce66" inactive-color="#ff4949" @change="formUpdate" />
    </el-form-item>
    <el-form-item label="文档类型">
      <el-select v-model="form.version" placeholder="请选择导出文件风格" @change="formUpdate">
        <el-option label="typescript" value="ts" />
        <el-option label="javascript" value="js" />
      </el-select>
    </el-form-item>
    <el-form-item label="文档类型">
      <el-select v-model="form.outputStyle" placeholder="请选择你要生成的文档类型" @change="formUpdate">
        <el-option label="默认导出" value="defaultExport" />
        <el-option label="具名导出" value="nameExport" />
        <el-option label="匿名导出" value="anonymous" />
      </el-select>
    </el-form-item>
    <el-form-item label="项目信息">
      <el-table :data="form.projects" :row-key="row => row.projectId" :expand-row-keys="list.expandRow" style="width: 100%" v-loading="list.loading">
        <el-table-column type="expand">
          <template #default="scope">
            <el-checkbox class="menu-checkbox" v-for="menu in scope.row.menus" :key="menu.catId" :label="menu" :checked="!!scope.row.group.find(item => item.catId === menu.catId)"
              @change="checkStatus => menuChange(checkStatus, menu, scope.row)">{{
                  menu.name
              }}</el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="项目ID">
          <template #default="scope">
            <el-input type="number" size="small" v-model="scope.row.projectId" @blur="initMenu" />
          </template>
        </el-table-column>
        <el-table-column label="导出路径">
          <template #default="scope">
            <el-input size="small" v-model="scope.row.outputDir" />
          </template>
        </el-table-column>
        <el-table-column label="baseURL">
          <template #default="scope">
            <el-input size="small" v-model="scope.row.prefix" />
          </template>
        </el-table-column>
        <el-table-column label="全量加载">
          <template #default="scope">
            <el-switch size="small" v-model="scope.row.isLoadFullApi" @change="formUpdate" />
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" type="danger" @click="handleRemoveProject(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button class="add-project" @click="addProject">添加项目</el-button>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="onSubmit">加载API文件</el-button>
    </el-form-item>
  </el-form>
</template>


<style scoped lang="scss">
</style>
