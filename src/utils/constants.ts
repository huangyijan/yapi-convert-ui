import demo from '../../static/demo.json'

export const config = {
  userId: 466,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjQ2NiwiaWF0IjoxNjU0NDE3MzM1LCJleHAiOjE2NTUwMjIxMzV9.hfllQdMiez0-S95PABCkUDBZfnNQD9T4B-ryd_Avn98",
  yapiURL: 'http://yapi.miguatech.com/project/445/interface/api',
  version: 'js',
  isNeedType: true,
  axiosFrom: 'import { fetch } from \'@/service/fetch/index\'',
  protocol: 'http:',
  axiosName: '',
  host: 'yapi.miguatech.com',
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

export const baseUrl = `http://api.mbiquwu.co` // 目标域名有跨域，起了一个服务做代理
