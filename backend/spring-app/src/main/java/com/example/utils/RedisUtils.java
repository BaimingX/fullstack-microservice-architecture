package com.example.utils;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.RedisConnectionCommands;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@SuppressWarnings(value = {"unchecked"})
@Component
@Slf4j
public class RedisUtils {
    private static RedisTemplate<String, Object> staticRedisTemplate;

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisUtils(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // Springboot启动成功之后会调用这个方法
    @PostConstruct
    public void initRedis() {
        // 初始化设置 静态staticRedisTemplate对象，方便后续操作数据
        staticRedisTemplate = redisTemplate;
    }

    /**
     * 缓存基本的对象，Integer、String、实体类等
     *
     * @param key   缓存的键值
     * @param value 缓存的值
     */
    public static <T> void setCacheObject(final String key, final T value) {
        staticRedisTemplate.opsForValue().set(key, value);
    }

    /**
     * 缓存基本的对象，Integer、String、实体类等
     *
     * @param key      缓存的键值
     * @param value    缓存的值
     * @param timeout  时间
     * @param timeUnit 时间颗粒度
     */
    public static <T> void setCacheObject(final String key, final T value, final long timeout, final TimeUnit timeUnit) {
        staticRedisTemplate.opsForValue().set(key, value, timeout, timeUnit);
    }

    /**
     * 获得缓存的基本对象。
     *
     * @param key 缓存键值
     * @return 缓存键值对应的数据
     */
    public static <T> T getCacheObject(final String key) {
        return (T) staticRedisTemplate.opsForValue().get(key);
    }

    /**
     * 删除单个对象
     *
     * @param key 缓存键值
     */
    public static boolean deleteObject(final String key) {
        return Boolean.TRUE.equals(staticRedisTemplate.delete(key));
    }

    /**
     * 获取单个key的过期时间
     *
     * @param key 缓存键值
     * @return 过期时间
     */
    public static Long getExpireTime(final String key) {
        return staticRedisTemplate.getExpire(key);
    }

    /**
     * 对 Hash 里的 field 做 increment
     */
    public static Long hashIncrement(String key, Object field, long delta) {
        return staticRedisTemplate.opsForHash().increment(key, field, delta);
    }

    /**
     * 获取整个 Hash
     */
    public static Map<Object, Object> getHash(String key) {
        return staticRedisTemplate.opsForHash().entries(key);
    }

    /**
     * 设置过期时间
     */
    public static Boolean expire(String key, long timeout, TimeUnit unit) {
        return staticRedisTemplate.expire(key, timeout, unit);
    }



    /**
     * 发送ping命令
     * redis 返回pong
     */
    public static void ping() {
        String res = staticRedisTemplate.execute(RedisConnectionCommands::ping);
        log.info("Redis ping ==== {}", res);
    }

    public static Long incr(String key) {
        return staticRedisTemplate.opsForValue().increment(key);
    }

}