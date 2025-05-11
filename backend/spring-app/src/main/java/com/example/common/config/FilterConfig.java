package com.example.common.config;

import com.example.common.filter.RateLimitFilter;
import com.example.common.filter.SimpleWafFilter;
import com.example.common.filter.XssFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 过滤器配置类
 */
@Configuration
public class FilterConfig {

    /**
     * 注册XSS过滤器
     */
    @Bean
    public FilterRegistrationBean<XssFilter> xssFilter() {
        FilterRegistrationBean<XssFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new XssFilter());
        // 最高优先级，在WAF过滤器之前执行
        registrationBean.setOrder(-1);
        // 设置过滤的URL模式
        registrationBean.addUrlPatterns("/*");
        return registrationBean;
    }

    /**
     * 注册WAF过滤器
     */
    @Bean
    public FilterRegistrationBean<SimpleWafFilter> wafFilter() {
        FilterRegistrationBean<SimpleWafFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new SimpleWafFilter());
        // WAF过滤器的优先级要高于限流过滤器
        registrationBean.setOrder(0);
        // 设置过滤的URL模式
        registrationBean.addUrlPatterns("/*");
        return registrationBean;
    }

    /**
     * 注册限流过滤器
     */
    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilter() {
        FilterRegistrationBean<RateLimitFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new RateLimitFilter());
        // 设置过滤器的优先级，数字越小优先级越高
        registrationBean.setOrder(1);
        // 设置过滤的URL模式
        registrationBean.addUrlPatterns("/*");
        return registrationBean;
    }
} 