package com.example.common.config;

import cn.dev33.satoken.stp.StpLogic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class SaTokenConfig {

    // 管理员端使用的 StpLogic（loginType = "backendUser"）
    @Primary
    @Bean
    public StpLogic stpLogicBackendUser() {
        return new StpLogic("backendUser");
    }

    // 用户端使用的 StpLogic（loginType = "coolUser"）
    @Bean
    public StpLogic stpLogicCoolUser() {
        return new StpLogic("coolUser");
    }
}
