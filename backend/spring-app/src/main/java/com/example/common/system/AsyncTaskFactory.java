package com.example.common.system;

import cn.hutool.core.date.DateUtil;
import com.example.entity.Logs;
import com.example.mapper.LogsMapper;
import com.example.utils.IpUtils;
import com.example.utils.SpringUtils;

import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.Timer;

/**
 * 管理所有多线程任务的线程执行工厂
 */
public class AsyncTaskFactory {

    private static final ThreadPoolTaskExecutor EXECUTOR = SpringUtils.getBean("threadPoolTaskExecutor");

    /**
     * 定义多线程执行任务
     * 记录日志
     * 模块、操作、操作人的ID、IP、操作时间
     */
    public static void recordLog(String module, String operate, Integer userId) {
        String ip = IpUtils.getIpAddr();
        EXECUTOR.execute(() -> {
            // 创建日志对象  存储到数据库
            Logs logs = Logs.builder()
                    .module(module)
                    .operate(operate)
                    .userId(userId)
                    .ip(ip)
                    .time(DateUtil.now())
                    .build();
            LogsMapper logsMapper = SpringUtils.getBean(LogsMapper.class);
            logsMapper.insert(logs);
        });
    }

}