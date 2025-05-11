package com.example.common.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * 安全响应头配置
 * 添加各种安全相关的HTTP响应头
 */
@Configuration
public class SecurityHeadersConfig {

    @Bean
    public FilterRegistrationBean<SecurityHeadersFilter> securityHeadersFilter() {
        FilterRegistrationBean<SecurityHeadersFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new SecurityHeadersFilter());
        registrationBean.addUrlPatterns("/*");
        registrationBean.setOrder(-1); // 最高优先级，在所有其他过滤器之前执行
        return registrationBean;
    }

    /**
     * 安全响应头过滤器
     * 为每个响应添加安全相关的HTTP头
     */
    public static class SecurityHeadersFilter extends OncePerRequestFilter {

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                         FilterChain filterChain) throws ServletException, IOException {
            // 1. 内容安全策略 (CSP)
            // 限制资源加载来源，防止XSS攻击
            response.setHeader("Content-Security-Policy", 
                    "default-src 'self'; " +
                    "script-src 'self' 'unsafe-inline'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "img-src 'self' data: http://localhost:* https://localhost:* https://*.auscoolstuff.com.au https://auscoolstuff.com.au; " +
                    "font-src 'self'; " +
                    "media-src 'self' blob: http://localhost:* https://localhost:* https://*.auscoolstuff.com.au https://auscoolstuff.com.au; " +
                    "connect-src 'self' https://admin.auscoolstuff.com.au https://auscoolstuff.com.au;");

            // 2. X-XSS-Protection
            // 启用浏览器XSS过滤
            response.setHeader("X-XSS-Protection", "1; mode=block");

            // 3. X-Content-Type-Options
            // 防止MIME类型嗅探
            response.setHeader("X-Content-Type-Options", "nosniff");

            // 4. X-Frame-Options
            // 防止点击劫持攻击
            response.setHeader("X-Frame-Options", "DENY");

            // 5. Referrer-Policy
            // 控制请求头中的Referer信息
            response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

            // 6. Strict-Transport-Security
            // 强制使用HTTPS（仅在HTTPS下生效）
            response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

            // 7. Cache-Control 和 Pragma
            // 防止敏感信息被缓存
            response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            response.setHeader("Pragma", "no-cache");
            response.setHeader("Expires", "0");

            // 继续过滤器链
            filterChain.doFilter(request, response);
        }
    }
} 