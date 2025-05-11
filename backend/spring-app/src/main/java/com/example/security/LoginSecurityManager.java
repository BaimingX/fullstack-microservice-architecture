package com.example.security;

import com.example.utils.RedisUtils;

import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.TimeUnit;

/**
 * 登录防爆破工具类
 * 同时支持：
 *   - IP -> 多用户
 *   - 用户 -> 多IP
 */
public class LoginSecurityManager {

    // ====== IP -> 多用户 (Hash) ======
    // Redis Key 前缀：针对某 IP 下，不同用户的失败次数
    private static final String IP_FAIL_KEY_PREFIX = "login:fail:ip:";

    // 当某 IP 下 >= IP_LOCK_USERS_COUNT 个用户都各自失败>= IP_LOCK_USER_FAIL_THRESHOLD 时 => 锁 IP
    // (你可自定义具体数值)
    private static final int IP_LOCK_USERS_COUNT = 3;         // 有多少用户都被撞
    private static final int IP_LOCK_USER_FAIL_THRESHOLD = 3; // 每个用户都失败多少次

    // ====== 用户 -> 多IP (Hash) ======
    // Redis Key 前缀：针对某用户，在不同 IP 上的失败次数
    private static final String USER_FAIL_KEY_PREFIX = "login:fail:user:";

    // 当某 user 在 >= USER_LOCK_IP_COUNT 个 IP 上都各自失败 >= USER_LOCK_IP_FAIL_THRESHOLD => 锁用户
    private static final int USER_LOCK_IP_COUNT = 3;          // 有多少IP都失败了
    private static final int USER_LOCK_IP_FAIL_THRESHOLD = 2; // 每个IP都失败多少次

    // 过期时间 (分钟)
    private static final long FAIL_RECORD_EXPIRE_MINUTES = 5;

    private static final String IP_USER_FAIL_PREFIX = "login:fail:ip_user:";

    // 单个 IP + 单个用户，超过 N 次就锁
    private static final int IP_USER_LOCK_THRESHOLD = 5;  // 5次
    private static final long IP_USER_EXPIRE_MINUTES = 5;


    public static void recordFailForIpUser(String ip, String email) {
        String key = IP_USER_FAIL_PREFIX + ip + ":" + email;
        // 哈希不是必须，这里用 key-value 也行，这里用自增 + 过期即可
        RedisUtils.incr(key);

        // 如果是第一次写入，需要设置过期
        Long ttl = RedisUtils.getExpireTime(key);
        if (ttl == null || ttl < 0) {
            RedisUtils.expire(key, IP_USER_EXPIRE_MINUTES, TimeUnit.MINUTES);
        }
    }

    public static boolean isIpUserLocked(String ip, String email) {
        String key = IP_USER_FAIL_PREFIX + ip + ":" + email;
        long failCount = getLongValue(key);
        return failCount >= IP_USER_LOCK_THRESHOLD;
    }

    /**
     * 登录成功后，清除这个 IP+用户 的失败记录
     */
    public static void clearIpUserFailRecord(String ip, String email) {
        String key = IP_USER_FAIL_PREFIX + ip + ":" + email;
        RedisUtils.deleteObject(key);
    }

    /**
     * 获取还剩多少秒解锁
     */
    public static long getRemainLockTimeForIpUser(String ip, String email) {
        String key = IP_USER_FAIL_PREFIX + ip + ":" + email;
        Long sec = RedisUtils.getExpireTime(key);
        return (sec == null) ? 0 : sec;
    }

    /* ====================  IP -> 多用户  ==================== */

    /**
     * 记录此 IP 下，指定 user 登录失败一次
     */
    public static void recordFailForIp(String ip, String email) {
        String key = IP_FAIL_KEY_PREFIX + ip;
        // Hash自增 field=email 的失败次数
        RedisUtils.hashIncrement(key, email, 1L);

        // 若第一次写入时，需要设置过期
        Long ttl = RedisUtils.getExpireTime(key);
        if (ttl == null || ttl < 0) {
            // 设置 5 分钟后过期
            RedisUtils.expire(key, FAIL_RECORD_EXPIRE_MINUTES, TimeUnit.MINUTES);
        }
    }

    /**
     * 判断此 IP 是否满足锁定条件：
     *   => Hash 中有 >= IP_LOCK_USERS_COUNT 个 用户，其失败次数 >= IP_LOCK_USER_FAIL_THRESHOLD
     */
    public static boolean isIpLocked(String ip) {
        String key = IP_FAIL_KEY_PREFIX + ip;
        Map<Object, Object> map = RedisUtils.getHash(key);
        if (map == null || map.isEmpty()) {
            return false;
        }

        int lockedUsers = 0;
        for (Entry<Object, Object> entry : map.entrySet()) {
            long failCount = parseLong(entry.getValue());
            if (failCount >= IP_LOCK_USER_FAIL_THRESHOLD) {
                lockedUsers++;
            }
            if (lockedUsers >= IP_LOCK_USERS_COUNT) {
                return true;
            }
        }
        return false;
    }

    /**
     * 清除 IP 下的所有登录失败记录
     */
    public static void clearIpFailRecord(String ip) {
        RedisUtils.deleteObject(IP_FAIL_KEY_PREFIX + ip);
    }

    /**
     * 获取此 IP 还剩多少秒解锁
     */
    public static long getRemainLockTimeForIp(String ip) {
        Long sec = RedisUtils.getExpireTime(IP_FAIL_KEY_PREFIX + ip);
        return (sec == null) ? 0 : sec;
    }


    /* ====================  用户 -> 多IP  ==================== */

    /**
     * 记录此 用户 在指定 IP 下登录失败一次
     */
    public static void recordFailForUser(String email, String ip) {
        String key = USER_FAIL_KEY_PREFIX + email;
        // Hash自增 field=ip
        RedisUtils.hashIncrement(key, ip, 1L);

        // 设置过期 (如果还没设置)
        Long ttl = RedisUtils.getExpireTime(key);
        if (ttl == null || ttl < 0) {
            RedisUtils.expire(key, FAIL_RECORD_EXPIRE_MINUTES, TimeUnit.MINUTES);
        }
    }

    /**
     * 判断此用户名是否满足锁定条件：
     *   => Hash中有 >= USER_LOCK_IP_COUNT 个 IP, 其失败次数 >= USER_LOCK_IP_FAIL_THRESHOLD
     */
    public static boolean isUserLocked(String email) {
        String key = USER_FAIL_KEY_PREFIX + email;
        Map<Object, Object> map = RedisUtils.getHash(key);
        if (map == null || map.isEmpty()) {
            return false;
        }

        int lockedIps = 0;
        for (Entry<Object, Object> entry : map.entrySet()) {
            long failCount = parseLong(entry.getValue());
            if (failCount >= USER_LOCK_IP_FAIL_THRESHOLD) {
                lockedIps++;
            }
            if (lockedIps >= USER_LOCK_IP_COUNT) {
                return true;
            }
        }
        return false;
    }

    /**
     * 清除此用户所有登录失败记录
     */
    public static void clearUserFailRecord(String email) {
        RedisUtils.deleteObject(USER_FAIL_KEY_PREFIX + email);
    }

    /**
     * 获取此用户名还剩多少秒解锁
     */
    public static long getRemainLockTimeForUser(String email) {
        Long sec = RedisUtils.getExpireTime(USER_FAIL_KEY_PREFIX + email);
        return (sec == null) ? 0 : sec;
    }


    /* ====================  内部工具方法  ==================== */

    /**
     * 安全转 long
     */
    private static long parseLong(Object val) {
        if (val == null) {
            return 0L;
        }
        return Long.parseLong(val.toString());
    }

    private static long getLongValue(String key) {
        Object val = RedisUtils.getCacheObject(key);
        if (val == null) return 0L;
        try {
            return Long.parseLong(val.toString());
        } catch (NumberFormatException e) {
            // 可选：记录错误日志，说明 Redis 数据异常
            return 0L;
        }
    }
}
