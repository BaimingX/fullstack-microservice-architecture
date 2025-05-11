package com.example.common.config;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpLogic;

import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import cn.dev33.satoken.context.SaHolder;

import cn.dev33.satoken.spring.SpringMVCUtil;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebConfig.class);
    
    @Resource
    private StpLogic stpLogicBackendUser;

    @Resource
    private StpLogic stpLogicCoolUser;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 后台管理接口，使用 backendUser 登录校验
        registry.addInterceptor(new SaInterceptor(handle -> {
                        try {
                        stpLogicBackendUser.checkLogin();
                        } catch (NotLoginException e) {
                        HttpServletRequest request = SpringMVCUtil.getRequest();
                        Object handler = SaHolder.getStorage().get("currHandlerMethod");
                        logControllerInfo(handler, "后台管理接口", request);
                        throw e;
                        }
                }))
                .addPathPatterns("/**") // 默认所有路径使用后台管理校验
                .excludePathPatterns(
                        "/",
                        "/login",
                        "/register",
                        "/files/download/**",
                        "/role/selectAll",
                        "/captcha",
                        // 以下是用户端接口，不应该用后台登录校验
                        "/carousel/selectPage",
                        "/site/selectAll",
                        "/goods/selectAll",
                        "/goods/selectPage",
                        "/goods/selectById/{id}",
                        "/media/goods/{goodsId}",
                        "/download/{goodsId:\\d+}/{fileName}",
                        "/coolStuffUser/**",
                        "/stripe/**"
                )
                .order(1);

        // 用户端接口，使用 coolUser 登录校验
        // 用户端接口，使用 coolUser 或 backendUser 登录校验
        registry.addInterceptor(new SaInterceptor(handle -> {
                    // 检查是否有用户登录或管理员登录
                    if (stpLogicBackendUser.isLogin()) {
                        // 已登录，允许通过
                        return;
                    }
                    // 未登录，抛出异常
                    // 未登录，抛出异常
                    try {
                        stpLogicCoolUser.checkLogin();
                    } catch (NotLoginException e) {
                        HttpServletRequest request = SpringMVCUtil.getRequest();
                        Object handler = SaHolder.getStorage().get("currHandlerMethod");
                        logControllerInfo(handler, "用户端接口", request);
                        throw e;
                    }
                }))
                .addPathPatterns(
                        "/coolStuffUser/**" // 用户端所有需要登录的接口
                )
                .excludePathPatterns(
                        "/coolStuffUser/register",
                        "/coolStuffUser/login",
                        "/coolStuffUser/oauth/google",
                        "/coolStuffUser/sendEmailCode"
                )
                .order(2);
    }

    /**
     * 记录触发token验证的Controller信息
     */
    private void logControllerInfo(Object handler, String apiType, HttpServletRequest request) {
        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;
            String controllerName = handlerMethod.getBeanType().getSimpleName();
            String methodName = handlerMethod.getMethod().getName();
            String requestURI = request.getRequestURI();
            
            logger.error("Token验证失败: {} - Controller: {}, 方法: {}, URI: {}", 
                    apiType, controllerName, methodName, requestURI);
        } else {
            logger.error("Token验证失败: {} - URI: {}", apiType, request.getRequestURI());
        }
    }
}