package com.example.common.filter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

/**
 * XSS请求包装器
 * 用于过滤HTTP请求中的XSS攻击代码
 */
public class XssRequestWrapper extends HttpServletRequestWrapper {

    // XSS攻击模式
    private static final Pattern[] XSS_PATTERNS = {
            // 防止script标签
            Pattern.compile("<script>(.*?)</script>", Pattern.CASE_INSENSITIVE),
            Pattern.compile("src[\r\n]*=[\r\n]*\\\'(.*?)\\\'", Pattern.CASE_INSENSITIVE),
            Pattern.compile("src[\r\n]*=[\r\n]*\\\"(.*?)\\\"", Pattern.CASE_INSENSITIVE),
            Pattern.compile("</script>", Pattern.CASE_INSENSITIVE),
            Pattern.compile("<script(.*?)>", Pattern.CASE_INSENSITIVE),
            
            // 防止eval等JavaScript执行函数
            Pattern.compile("eval\\((.*?)\\)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("expression\\((.*?)\\)", Pattern.CASE_INSENSITIVE),
            
            // 防止其他危险HTML标签
            Pattern.compile("<iframe>(.*?)</iframe>", Pattern.CASE_INSENSITIVE),
            Pattern.compile("<iframe(.*?)>", Pattern.CASE_INSENSITIVE),
            Pattern.compile("<object>(.*?)</object>", Pattern.CASE_INSENSITIVE),
            Pattern.compile("<object(.*?)>", Pattern.CASE_INSENSITIVE),
            Pattern.compile("<embed>(.*?)</embed>", Pattern.CASE_INSENSITIVE),
            Pattern.compile("<embed(.*?)>", Pattern.CASE_INSENSITIVE),
            
            // 防止JS事件
            Pattern.compile("onload(.*?)=", Pattern.CASE_INSENSITIVE),
            Pattern.compile("onerror(.*?)=", Pattern.CASE_INSENSITIVE),
            Pattern.compile("onclick(.*?)=", Pattern.CASE_INSENSITIVE),
            Pattern.compile("onmouseover(.*?)=", Pattern.CASE_INSENSITIVE),
            
            // 防止JS伪协议
            Pattern.compile("javascript:", Pattern.CASE_INSENSITIVE),
            Pattern.compile("vbscript:", Pattern.CASE_INSENSITIVE),
            
            // 防止data URI
            Pattern.compile("data:text/html", Pattern.CASE_INSENSITIVE)
    };

    /**
     * 构造函数
     */
    public XssRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    /**
     * 重写获取参数方法，对参数进行XSS过滤
     */
    @Override
    public String getParameter(String name) {
        String value = super.getParameter(name);
        return stripXss(value);
    }

    /**
     * 重写获取参数值数组方法，对参数进行XSS过滤
     */
    @Override
    public String[] getParameterValues(String name) {
        String[] values = super.getParameterValues(name);
        if (values == null) {
            return null;
        }

        String[] encodedValues = new String[values.length];
        for (int i = 0; i < values.length; i++) {
            encodedValues[i] = stripXss(values[i]);
        }

        return encodedValues;
    }

    /**
     * 重写获取请求头方法，对请求头进行XSS过滤
     */
    @Override
    public String getHeader(String name) {
        String value = super.getHeader(name);
        return stripXss(value);
    }

    /**
     * 过滤XSS攻击字符串
     */
    private String stripXss(String value) {
        if (!StringUtils.hasText(value)) {
            return value;
        }

        // 替换特殊字符为其HTML实体
        String cleanValue = value
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll("\\(", "&#40;")
                .replaceAll("\\)", "&#41;")
                .replaceAll("'", "&#39;")
                .replaceAll("\"", "&quot;");

        // 对所有XSS模式进行过滤
        for (Pattern pattern : XSS_PATTERNS) {
            cleanValue = pattern.matcher(cleanValue).replaceAll("");
        }

        return cleanValue;
    }
} 