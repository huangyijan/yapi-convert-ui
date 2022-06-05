
interface CustomParam {
  name: string,
  default: string | number
}

interface CatConfig {
  catId: number | string
  fileName?: string
  outputDir?: string
  name: string
}

declare interface ProjectBaseConfig {
  add_time: number | string,
  basepath: string | string,
  desc: string,
  defaultRespBody: {
    [key: string]: any
  },
  env: Array<{
    header: any[],
    name: string,
    domain: string,
    _id: number | string
  }>,
  group_id: number,
  icon: string,
  is_json5: boolean,
  is_mock_open: false,
  name: string,
  role: string,
  project_type: string,
  tag: Array<any>,
  uid: number | string,
  up_time: number | string,
  _id: number
}


interface ProjectConfig {
  projectId: number | string,
  outputDir: string,
  isLoadFullApi: boolean
  hideUnDoneApi?: boolean
  prefix?: string
  group?: Array<CatConfig>,
  customParams?: Array<CustomParam>
  /** 请求路径，自动生成 */
  requestUrl?: string,
  projectBaseConfig?: ProjectBaseConfig
}


interface ApiConfig {
  yapiURL: string
  token?: string
  userId?: string
  version: string
  isNeedType: boolean
  isNeedAxiosType?: boolean
  axiosFrom: string
  axiosName?: string
  outputStyle?: string
  protocol: string
  host: string
  runNow?: boolean
  customParams?: Array<CustomParam>
  projects: Array<ProjectConfig>
}

