import { ElMessage } from 'element-plus';
import router from '../router'
import axios from "axios";

// 判断当前环境
const isDev = import.meta.env.MODE === 'development';

const request = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    timeout: 30000,  // 后台接口超时时间设置
    withCredentials: isDev ? false : true // 开发环境下不启用withCredentials，避免CORS问题
})

// request 拦截器
// 可以自请求发送前对请求做一些处理
request.interceptors.request.use(config => {
    config.headers['Content-Type'] = 'application/json;charset=utf-8';
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    config.headers['X-Content-Type-Options'] = 'nosniff';
    config.headers['X-XSS-Protection'] = '1; mode=block';
    
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    config.headers['headlesscmstoken'] = user.token || ''
    
    // 调试日志 - 检查请求类型和token设置
    console.log(`发送${config.method.toUpperCase()}请求到${config.url}，token: ${config.headers['headlesscmstoken']}`)
    
    return config
}, error => {
    return Promise.reject(error)
});

// response 拦截器
// 可以在接口响应后统一处理结果
request.interceptors.response.use(
    response => {
        let res = response.data;
        // 如果是返回的文件
        if (response.config.responseType === 'blob') {
            return res
        }
        // 兼容服务端返回的字符串数据
        if (typeof res === 'string') {
            res = res ? JSON.parse(res) : res
        }
        // 当权限验证不通过的时候给出提示
        if (res.code === '401') {
            ElMessage.error(res.msg)
            router.push("/login")
        }
        return res;
    },
        error => {
        console.log('err' + error)
        return Promise.reject(error)
    }
)


export default request
