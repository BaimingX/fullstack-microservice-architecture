package com.example.common.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

/**
 * XSS过滤器
 * 将请求封装为XssRequestWrapper以过滤XSS攻击
 */
@Slf4j
public class XssFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        log.info("XSS过滤器已初始化");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        // 将原始请求包装为XSS过滤请求
        XssRequestWrapper wrappedRequest = new XssRequestWrapper((HttpServletRequest) request);
        
        // 使用包装后的请求继续过滤器链
        chain.doFilter(wrappedRequest, response);
    }

    @Override
    public void destroy() {
        log.info("XSS过滤器已销毁");
    }
} 