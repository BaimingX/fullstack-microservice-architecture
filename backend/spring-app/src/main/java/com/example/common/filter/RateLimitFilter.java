package com.example.common.filter;

import com.example.utils.IpUtils;
import com.example.utils.RedisUtils;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * 简单的请求限流过滤器
 * 基于Redis实现的IP限流
 */
@Slf4j
public class RateLimitFilter implements Filter {

    // IP限流：单个IP每分钟最多允许的请求数
    private static final int REQUESTS_PER_MINUTE = 180;
    
    // Redis Key前缀
    private static final String RATE_LIMIT_PREFIX = "rate_limit:";
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // 获取客户端IP地址
        String ipAddress = IpUtils.getIpAddr();
        
        // 创建Redis Key: rate_limit:IP地址:当前分钟
        String minute = String.valueOf(System.currentTimeMillis() / (1000 * 60));
        String redisKey = RATE_LIMIT_PREFIX + ipAddress + ":" + minute;
        
        // 增加计数并获取当前IP的请求次数
        Long count = RedisUtils.incr(redisKey);
        
        // 设置Key的过期时间为1分钟
        if (count == 1) {
            RedisUtils.expire(redisKey, 1, TimeUnit.MINUTES);
        }
        
        // 如果请求次数超过限制
        if (count > REQUESTS_PER_MINUTE) {
            log.warn("IP: {} 请求频率超过限制，已被限流", ipAddress);
            httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            httpResponse.getWriter().write("请求过于频繁，请稍后再试");
            return;
        }
        
        // 放行请求
        chain.doFilter(request, response);
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        log.info("限流过滤器已初始化");
    }

    @Override
    public void destroy() {
        log.info("限流过滤器已销毁");
    }
} 