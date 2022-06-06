<template>
  <el-row>
    <el-col :span="6" class="config-form">
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

        <el-form-item>
          <el-button type="primary" @click="onSubmit">加载API文件</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col :span="18" class="code-wrap">
      <el-collapse v-model="activeNames" @change="handleChange" v-for="(item, index) in list.codes">
        <el-collapse-item :title="`目标输出路径：${item.savePath}`" :name="index">
          <div>
            <Edit :id="`edit${index}`" :code="item.saveFileBuffer"></Edit>
          </div>
        </el-collapse-item>
      </el-collapse>

    </el-col>
  </el-row>

</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { request, handleApiRequestError } from '../utils/request'
import { generatorFileCode, getApiFileName, getSavePath } from 'aomi-yapi'
import Edit from './Edit.vue'
import demo from '../../static/demo.json'

import { ElLoading, ElMessage } from 'element-plus'

const form: ApiConfig = reactive({
  userId: 466,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjQ2NiwiaWF0IjoxNjU0NDE3MzM1LCJleHAiOjE2NTUwMjIxMzV9.hfllQdMiez0-S95PABCkUDBZfnNQD9T4B-ryd_Avn98",
  yapiURL: 'http://yapi.miguatech.com/project/445/interface/api',
  version: 'ts',
  isNeedType: true,
  axiosFrom: 'import { fetch } from \'@/service/fetch/index\'',
  protocol: 'http:',
  axiosName: '',
  host: 'api.mbiquwu.co',
  isNeedAxiosType: true,
  outputStyle: 'defaultExport',
  projects: [
    {
      data: demo,
      projectId: '445',
      outputDir: 'src/api',
      isLoadFullApi: false,
      prefix: '/aomi-market-admin-server',
      group: [
        {
          catId: 13540,
          name: '预售活动'
        },
        {
          catId: 14303,
          name: '拼团活动',
          fileName: 'index',
          outputDir: 'src/api/group'
        },
        {
          catId: 15157,
          name: '搜索词'
        }
      ] as Array<CatConfig>
    },
  ]
}
)



const list = reactive({
  codes: []
})

const onSubmit = () => {
  main(form)
}

/**
 * 注册全局变量，node环境注册global里面的对象，browser环境注册global 到window对象
 * @param config 配置项
 */
const registerGlobal = (config: ApiConfig) => {
  window.global = { apiConfig: config } as any // 浏览器注册全局变量
}

/** 生成没有注释的API文件，注释有文档链接，可以直接跳转 */
const generatorFileList = (project: ProjectConfig) => {
  const nameChunk = new Map() // 用来处理文件命名的容器
  const { group, isLoadFullApi } = project
  const hasSaveNames: string[] = [] // 处理已经命名的容器
  project.data.forEach((item: any) => {
    if (!item.list.length) return
    const fileConfig = group?.find(menu => menu.catId == item.list[0].catid)
    if (!isLoadFullApi && !fileConfig) return

    const saveFileBuffer = generatorFileCode(item, project)
    if (!saveFileBuffer) return

    const FileName = getApiFileName(item, hasSaveNames)
    const savePath = getSavePath(FileName, project, fileConfig, nameChunk)
    list.codes.push({ savePath, saveFileBuffer })
  })
}

const main = async (config: ApiConfig) => {
  registerGlobal(config)
  const { protocol, host, projects } = config
  const baseUrl = `${protocol}//${host}`
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  projects.forEach(project => {
    const { projectId } = project
    const projectConfigUrl = `${baseUrl}/api/project/get?id=${projectId}`

    request(projectConfigUrl)
      .then(projectConfigStr => {
        const projectConfig = JSON.parse(projectConfigStr)
        project.projectBaseConfig = projectConfig.data
        project.requestUrl = `${baseUrl}/api/plugin/export?type=json&pid=${projectId}&status=all&isWiki=false` // jsonUrl
        return request(project.requestUrl)
      })
      .then(fileString => {
        const commonJson = JSON.parse(fileString)
        project.data = commonJson
        loading.close()
        generatorFileList(project)
      })
      .catch(error => {
        ElMessage.error(error.toString())
        handleApiRequestError(String(error))
      })

  })
}

const activeNames = ref([0])

const handleChange = (val: string[]) => {
  console.log(val)
}

const formUpdate = () => {
  list.codes = []
  form.projects.forEach(project => {
    generatorFileList(project)

  })
}

onMounted(() => {
  registerGlobal(form)
  generatorFileList(form.projects[0])
})

</script>

<style scoped lang="scss">
.config-form {
  padding: 10px 0;
}

.code-wrap {
  padding: 0 10px;
}
</style>