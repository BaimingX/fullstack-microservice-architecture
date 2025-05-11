package com.example.utils;

import cn.dev33.satoken.stp.StpLogic;
import com.example.entity.CoolStuffUser;
import com.example.entity.User;
import com.example.mapper.CoolStuffUserMapper;
import com.example.mapper.UserMapper;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

@Component
public class SaUtils {

    @Resource
    private UserMapper userMapper;

    @Resource
    private CoolStuffUserMapper coolStuffUserMapper;

    @Resource
    @Qualifier("stpLogicBackendUser")
    private StpLogic backendLogicFromSpring;

    @Resource
    @Qualifier("stpLogicCoolUser")
    private StpLogic coolLogicFromSpring;

    public static StpLogic stpLogicBackendUser;
    public static StpLogic stpLogicCoolUser;

    private static UserMapper staticUserMapper;
    private static CoolStuffUserMapper staticCoolUserMapper;

    @PostConstruct
    public void init() {
        stpLogicBackendUser = backendLogicFromSpring;
        stpLogicCoolUser = coolLogicFromSpring;
        staticUserMapper = userMapper;
        staticCoolUserMapper = coolStuffUserMapper;
    }

    /*
     * 获取后台端登录用户
     */
    public static User getLoginUser() {
        Object loginId = stpLogicBackendUser.getLoginId();
        if (loginId != null) {
            Integer userId = Integer.valueOf(loginId.toString());
            return staticUserMapper.selectById(userId);
        }
        return null;
    }

    /*
     * 获取 coolStuff 登录用户
     */
    public static CoolStuffUser getLoginCoolStuffUser() {
        Object loginId = stpLogicCoolUser.getLoginId();
        if (loginId != null) {
            Integer userId = Integer.valueOf(loginId.toString());
            return staticCoolUserMapper.selectById(userId);
        }
        return null;
    }
}
