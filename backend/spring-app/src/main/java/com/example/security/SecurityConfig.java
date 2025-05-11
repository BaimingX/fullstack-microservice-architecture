//package com.example.security;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.annotation.web.configuration.WebSecurityConfiguration;
//import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.CorsConfigurationSource;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//
//import java.util.Arrays;
//import java.util.Collections;
//
//@Configuration
//@EnableWebSecurity
//public class SecurityConfig {
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .csrf(AbstractHttpConfigurer::disable)
//                .cors(cors -> cors.configurationSource(configurationSource()))
//                .sessionManagement(session -> session
//                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .authorizeHttpRequests(auth -> auth
//                        .requestMatchers("/public").permitAll()
//                        .anyRequest().authenticated()
//                )
//                .formLogin(form -> form
//                        .passwordParameter("password") // 指定密码参数名
//                        .loginProcessingUrl("/login") // 指定处理登录请求的 URL
//                );
//
//
//        return http.build();
//    }
//
//    @Bean
//    public CorsConfigurationSource configurationSource() {
//        CorsConfiguration configuration = new CorsConfiguration();
//
//        // 开发环境允许所有域访问
//        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
//
//        // 允许所有 HTTP 方法
//        configuration.setAllowedMethods(Collections.singletonList("*"));
//
//        // 允许所有请求头
//        configuration.setAllowedHeaders(Collections.singletonList("*"));
//
//        // 允许携带凭证（在开发环境可以开，但生产环境要注意）
//        configuration.setAllowCredentials(true);
//
//        // 预检请求的缓存时间（1小时）
//        configuration.setMaxAge(3600L);
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", configuration);
//
//        return source;
//    }
//
//}