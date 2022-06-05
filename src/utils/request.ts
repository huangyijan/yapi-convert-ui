/** 获取通用请求头 */
export const getHeader = () => {
    const config = window.global.apiConfig
    const token = config.token
    const userId = config.userId
    const HeaderConfig = {
        Cookie: `_yapi_token=${token}; _yapi_uid=${userId}`,
        Accept: 'application/json, text/plain, */*'
    }
    return HeaderConfig
}


export const request = (url: string, method = 'post') => {
    return new Promise<string>((resolve) => {
        const http = new XMLHttpRequest()

        http.open(method, url, true)


        http.onreadystatechange = function () {
            if (http.readyState == 4 && http.status == 200) {
                resolve(http.responseText)
            } 
        }
        const headerBody = JSON.stringify(getHeader())
        http.send(headerBody)
    })
}

export const handleApiRequestError = (error: string) => {
    if (error.includes('40011')) {
        console.log('\n\x1b[33m', 'token 已经过期， 请从yapi文档获取最新token')
    } else {
        console.log(error)
    }
}