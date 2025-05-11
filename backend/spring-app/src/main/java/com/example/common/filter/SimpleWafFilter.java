package com.example.common.filter;

import com.example.utils.IpUtils;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.*;
import java.util.regex.Pattern;

/**
 * 简易WAF过滤器
 * 用于防御常见的SQL注入和XSS攻击
 */
@Slf4j
public class SimpleWafFilter implements Filter {

    // SQL注入危险关键词
    private static final List<String> SQL_INJECTION_PATTERNS = Arrays.asList(
            "\\bSELECT\\b", "\\bUNION\\b", "\\bDROP\\b", "\\bDELETE\\b", "\\bINSERT\\b",
            "\\bALTER\\b", "\\bUPDATE\\b", "\\bCREATE\\b", "\\bEXEC\\b", "\\bEXECUTE\\b",
            "\\bTRUNCATE\\b", "--", "/\\*", "\\*/", "';", "\\bOR\\s+1=1\\b"
    );

    // XSS攻击危险关键词
    private static final List<String> XSS_PATTERNS = Arrays.asList(
            "<script>", "</script>", "javascript:", "onerror=", "onload=", "eval\\(", "document\\.cookie"
    );

    // 编译正则表达式模式
    private final List<Pattern> sqlPatterns = new ArrayList<>();
    private final List<Pattern> xssPatterns = new ArrayList<>();

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // 预编译SQL注入检测模式
        for (String pattern : SQL_INJECTION_PATTERNS) {
            sqlPatterns.add(Pattern.compile(pattern, Pattern.CASE_INSENSITIVE));
        }

        // 预编译XSS攻击检测模式
        for (String pattern : XSS_PATTERNS) {
            xssPatterns.add(Pattern.compile(pattern, Pattern.CASE_INSENSITIVE));
        }

        log.info("WAF过滤器已初始化");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // 获取 QueryString（例如 ?name=xxx&key=yyy），如果是 POST JSON，可能为空
        String queryString = httpRequest.getQueryString();

        // 1) 检测 QueryString 本身
        if (containsSqlInjection(queryString) || containsXss(queryString)) {
            log.warn("检测到疑似SQL/XSS攻击：IP={}, QueryString={}",
                    IpUtils.getIpAddr(), queryString);
            httpResponse.setStatus(HttpStatus.FORBIDDEN.value());
            httpResponse.getWriter().write("非法请求");
            return;
        }

        // 2) 检测具体的请求参数（包括GET/POST form-data）
        if (checkParameters(httpRequest)) {
            log.warn("检测到疑似SQL/XSS攻击：IP={}, URI={}, 参数中包含危险关键词",
                    IpUtils.getIpAddr(), httpRequest.getRequestURI());
            httpResponse.setStatus(HttpStatus.FORBIDDEN.value());
            httpResponse.getWriter().write("非法请求");
            return;
        }

        // 放行请求
        chain.doFilter(request, response);
    }

    /**
     * 遍历所有请求参数，检测是否包含SQL/XSS关键词
     */
    private boolean checkParameters(HttpServletRequest request) {
        // getParameterNames() 能拿到 query / form-data 的 key，如果是 JSON body + @RequestBody，就要再看你是否处理。
        Enumeration<String> paramNames = request.getParameterNames();
        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            // 取该参数的值（如果是多值，以逗号分隔）
            String[] values = request.getParameterValues(paramName);
            if (values != null) {
                for (String val : values) {
                    if (containsSqlInjection(val) || containsXss(val)) {
                        return true; // 只要有一个命中，就算不安全
                    }
                }
            }
        }
        return false;
    }

    /**
     * 检测字符串是否包含SQL注入攻击模式
     */
    private boolean containsSqlInjection(String value) {
        if (!StringUtils.hasText(value)) {
            return false;
        }
        for (Pattern pattern : sqlPatterns) {
            if (pattern.matcher(value).find()) {
                return true;
            }
        }
        return false;
    }

    /**
     * 检测字符串是否包含XSS攻击模式
     */
    private boolean containsXss(String value) {
        if (!StringUtils.hasText(value)) {
            return false;
        }
        for (Pattern pattern : xssPatterns) {
            if (pattern.matcher(value).find()) {
                return true;
            }
        }
        return false;
    }

    @Override
    public void destroy() {
        log.info("WAF过滤器已销毁");
    }
}
