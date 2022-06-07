<template>
  <el-row class="main-row">
    <el-col :span="11" class="config-form">
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
          <el-switch v-model="form.isNeedType" @change="formUpdate" />
        </el-form-item>
        <el-form-item label="axios参数提示">
          <el-switch v-model="form.isNeedAxiosType" @change="formUpdate" />
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
          <el-table :data="form.projects" @expand-change="expandChange" :row-key="row => row.projectId" :expand-row-keys="list.expandRow" style="width: 100%" v-loading="list.loading">
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
                <el-switch size="small" v-model="scope.row.isLoadFullApi" @change="formUpdate(); initMenu()" />
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
          <el-button type="primary" @click="main">加载API文件</el-button>
          <el-button type="success" @click="copy">复制配置文件</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <Arrow />
    <el-col :span="12" class="code-wrap">
      <el-collapse v-model="activeNames" v-for="(item, index) in list.codes" class="code-collapse">
        <el-collapse-item :name="index">
          <template #title>
            <div class="title-collapse">
              <div>
                <el-icon class="header-icon" :size="20">
                  <Folder />
                </el-icon>&nbsp;API输出路径：{{ item.savePath}}
              </div>
              <el-icon class="edit-icon" :size="20" @click.stop="editChange(item, index)">
                <IconEdit />
              </el-icon>
            </div>

          </template>
          <div>
            <Edit :id="`edit${index}`" ref="getEdit" :code="item.saveFileBuffer"></Edit>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-col>

    <el-drawer :with-header="false" destroy-on-close v-model="list.showCode"  direction="rtl" size="70%">
      <Code id="codeWrap" :code="list.item.saveFileBuffer"></Code>
    </el-drawer>
  </el-row>

</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { request, handleApiRequestError } from '../utils/request'
import { generatorFileCode, getApiFileName, getSavePath } from '../assets/aomi-yapi.js'
import Edit from './Edit.vue'
import Code from './Code.vue'
import Arrow from './Arrow.vue'
import { config, baseUrl } from '../utils/constants'
import { ElLoading, ElMessage } from 'element-plus'
import { copyConfig, registerGlobal } from '../utils'
import {
  Folder, Edit as IconEdit
} from '@element-plus/icons-vue'
const form: ApiConfig = reactive(config)
const list = reactive({
  codes: [],
  item: {} as any,
  showCode: false,
  loading: false,
  expandRow: []
})
const activeNames = ref([0])

const editChange = (item, index) => {
  list.item = item
  list.showCode = !list.showCode
  
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

/** 根据配置网络请求加载api列表 */
const main = async () => {
  const config = form
  registerGlobal(config)
  const { projects } = config
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
        loading.close()
        ElMessage.error(error.toString())
        handleApiRequestError(String(error))
      })

  })
}


/** 删除项目 */
const handleRemoveProject = (index: number) => {
  form.projects.splice(index, 1)
}

/** 展开行处理 */
const expandChange = (row: ProjectConfig) => {
  const isExpand = list.expandRow.findIndex(projectId => projectId === row.projectId)
  if (isExpand > -1) {
    return list.expandRow.splice(isExpand, 1)
  }
  row.isLoadFullApi = false
  list.expandRow.push(row.projectId)
  initMenu()
}

/** 拷贝配置 */
const copy = () => {
  const config = JSON.parse(JSON.stringify(form)) 
  config.projects.forEach(item => {
    delete item.data
    delete item.menus
    delete item.token
    delete item.userId
  })
  copyConfig(JSON.stringify(config))
}

/** 二级菜单变化 */
const menuChange = (value: boolean, menu: CatConfig, project: ProjectConfig) => {
  if (value) {
    project.group.push(menu)
  } else {
    const index = project.group.findIndex(item => item.catId === menu.catId)
    if (index > -1) project.group.splice(index, 1)
  }
  list.codes = []
  generatorFileList(project)
}

/** 添加项目 */
const addProject = () => {
  form.projects.push({
    projectId: '',
    outputDir: '',
    isLoadFullApi: true,
    prefix: '',
    group: []
  })
}

/** 更新表单 */
const formUpdate = () => {
  list.codes = []
  form.projects.forEach(project => {
    generatorFileList(project)
  })
}

/** 加载form表单 */
const initMenu = () => {
  form.projects.forEach(project => {
    if (project.isLoadFullApi) return
    list.expandRow.push(project.projectId)
    list.loading = true
    const MenuUrl = `${baseUrl}/api/interface/list_menu?project_id=${project.projectId}`
    request(MenuUrl).then(menuStr => {
      const { data } = JSON.parse(menuStr)
      project.menus = data.map(item => {
        return { catId: item._id, name: item.name }
      })
      list.loading = false

    })
      .catch(err => {
        ElMessage.error(err.toString())
      })
  })
}

onMounted(() => {
  registerGlobal(form)

  initMenu()
  generatorFileList(form.projects[0])
})

</script>

<style scoped lang="scss">


.main-row {
  width: 100vw;
  height: calc(100vh - 60px);

  .config-form {
    padding: 10px 0;
    height: 100%;
    overflow: auto;

    .group-tag {
      margin-right: 10px;
    }

    .add-project {
      width: 100%;
      margin-top: 16px;
    }

    .menu-checkbox {
      width: 150px;
    }
  }


  .code-wrap {
    padding: 10px;
    height: 100%;
    overflow: auto;
    .title-collapse {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      div:nth-child(1) {
        display: flex;
        align-items: center;
      }
      .edit-icon {
        margin-right: 10px;
      }
    }
    .code-collapse {
      width: 95%;
    }
  }
}
</style>