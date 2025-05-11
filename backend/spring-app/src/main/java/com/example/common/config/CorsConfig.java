package com.example.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * 跨域配置
 */
@Configuration
public class CorsConfig {

    @Value("${security.allowed-origins:https://auscoolstuff.com.au,https://admin.auscoolstuff.com.au}")
    private String[] allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        
        // 使用更具体的来源模式列表
        corsConfiguration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*", 
            "https://localhost:*",
            "http://127.0.0.1:*",
            "https://127.0.0.1:*",
            "https://*.auscoolstuff.com.au",
            "https://auscoolstuff.com.au",
            "https://admin.auscoolstuff.com.au",
            "http://45.76.112.52:*",
            "https://45.76.112.52:*"
        ));
        
        // 设置允许的请求头
        corsConfiguration.setAllowedHeaders(Arrays.asList("*"));
        
        // 设置允许的请求方法，明确列出所有允许的HTTP方法
        corsConfiguration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        
        // 允许的暴露头信息
        corsConfiguration.setExposedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        
        // 是否允许发送Cookie
        corsConfiguration.setAllowCredentials(true);
        
        // 预检请求的缓存时间（秒）
        corsConfiguration.setMaxAge(3600L);
        
        // 对所有接口应用CORS配置
        source.registerCorsConfiguration("/**", corsConfiguration);
        
        return new CorsFilter(source);
    }
}