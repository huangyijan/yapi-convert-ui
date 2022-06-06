import { ElMessage } from 'element-plus'

/**
 * 注册全局变量，node环境注册global里面的对象，browser环境注册global 到window对象
 * @param config 配置项
 */
export const registerGlobal = (config: ApiConfig) => {
  window.global = { apiConfig: config } as any // 浏览器注册全局变量
}

export const copyConfig = (config: string) => {
  const input = document.createElement('input')
  document.body.appendChild(input)
  input.setAttribute(
    'value',
    config
  )
  input.select()
  if (document.execCommand('copy')) {
    document.execCommand('copy')
    ElMessage.success('复制成功')
  }
  document.body.removeChild(input)
}