package com.example.service;

import cn.dev33.satoken.stp.StpLogic;
import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.crypto.SecureUtil;
import com.example.common.Constants;
import com.example.common.enums.LogModuleEnum;
import com.example.common.enums.ResultCodeEnum;
import com.example.common.system.AsyncTaskFactory;
import com.example.entity.GoogleUserDTO;
import com.example.entity.Menu;
import com.example.entity.Site;
import com.example.entity.CoolStuffUser;
import com.example.exception.CustomException;
import com.example.mapper.CoolStuffUserMapper;
import com.example.security.LoginSecurityManager;
import com.example.utils.IpUtils;
import com.example.utils.RedisUtils;
import com.example.utils.SaUtils;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;


/**
 * 用户业务处理
 **/
@Service
public class CoolStuffUserService {

    @Resource
    private CoolStuffUserMapper coolStuffUserMapper;

    @Resource
    private EmailService emailService;

    @Resource
    private StpLogic  stpLogicCoolUser;

    /**
     * 新增
     */
    public void add(CoolStuffUser coolStuffUser) {

        if (ObjectUtil.isEmpty(coolStuffUser.getEmail())) {
            throw new CustomException("400","Email can't be empty");
        }
        CoolStuffUser dbCoolStuffUser = coolStuffUserMapper.selectByEmail(coolStuffUser.getEmail());
        if (ObjectUtil.isNotNull(dbCoolStuffUser)) {
            throw new CustomException(ResultCodeEnum.USER_EXIST_ERROR);
        }
        if (ObjectUtil.isEmpty(coolStuffUser.getPassword())) {
            coolStuffUser.setPassword(securePassword(Constants.USER_DEFAULT_PASSWORD));
        }else {
            coolStuffUser.setPassword(securePassword(coolStuffUser.getPassword()));
        }
        if (ObjectUtil.isEmpty(coolStuffUser.getUsername())) {
            coolStuffUser.setUsername(coolStuffUser.getEmail());
        }


        coolStuffUserMapper.insert(coolStuffUser);
    }

    /**
     * 删除
     */
    public void deleteById(Integer id) {
        coolStuffUserMapper.deleteById(id);
    }

    /**
     * 批量删除
     */
    public void deleteBatch(List<Integer> ids) {
        for (Integer id : ids) {
            coolStuffUserMapper.deleteById(id);
        }
    }

    /**
     * 修改
     */
    public void updateById(CoolStuffUser coolStuffUser) {
        coolStuffUserMapper.updateById(coolStuffUser);
    }

    /**
     * 根据ID查询
     */
    public CoolStuffUser selectById(Integer id) {
        return coolStuffUserMapper.selectById(id);
    }

    /**
     * 查询所有
     */
    public List<CoolStuffUser> selectAll(CoolStuffUser coolStuffUser) {
        return coolStuffUserMapper.selectAll(coolStuffUser);
    }

    /**
     * 分页查询
     */
    public PageInfo<CoolStuffUser> selectPage(CoolStuffUser coolStuffUser, Integer pageNum, Integer pageSize) {
        PageHelper.startPage(pageNum, pageSize);
        List<CoolStuffUser> list = coolStuffUserMapper.selectAll(coolStuffUser);
        return PageInfo.of(list);
    }

    /**
     * 注册
     */
    public void register(CoolStuffUser coolStuffUser, String codeFromUser) {
        if (ObjectUtil.isEmpty(coolStuffUser.getEmail())) {
            throw new CustomException("400","Email can't be empty");
        }

        String realCode = RedisUtils.getCacheObject("register:code:" + coolStuffUser.getEmail());
        if (realCode == null || !codeFromUser.equals(realCode)) {
            throw new CustomException("400", "Verification code is incorrect or has expired");
        }


        CoolStuffUser dbCoolStuffUser = coolStuffUserMapper.selectByEmail(coolStuffUser.getEmail());
        if (ObjectUtil.isNotNull(dbCoolStuffUser)) {
            throw new CustomException(ResultCodeEnum.USER_EXIST_ERROR);
        }
        add(coolStuffUser);
        AsyncTaskFactory.recordLog(LogModuleEnum.USER.value,"cool stuff 注册", coolStuffUser.getId() );
    }


    public void sendEmailCode(CoolStuffUser coolStuffUser) {
        if (ObjectUtil.isEmpty(coolStuffUser.getEmail())) {
            throw new CustomException("400", "Email can't be empty");
        }

        CoolStuffUser user = coolStuffUserMapper.selectByEmail(coolStuffUser.getEmail());
        if (ObjectUtil.isNotNull(user)) {
            throw new CustomException(ResultCodeEnum.USER_EXIST_ERROR);
        }

        String code = emailService.sendVerificationCode(coolStuffUser.getEmail());
        RedisUtils.setCacheObject("register:code:" + coolStuffUser.getEmail(), code, 5, TimeUnit.MINUTES);

    }


    public CoolStuffUser login(CoolStuffUser coolStuffUser) {


        // ========== A. 先获取客户端IP ==========
        String clientIp = IpUtils.getIpAddr();

        // ========== B. 检查IP是否已被锁定 ==========
        if (LoginSecurityManager.isIpLocked(clientIp)) {
            long seconds = LoginSecurityManager.getRemainLockTimeForIp(clientIp);
            throw new CustomException(ResultCodeEnum.ACCOUNT_LOCKED, seconds);
        }

        // ========== C. 检查用户名是否已被锁定 ==========
        if (LoginSecurityManager.isUserLocked(coolStuffUser.getEmail())) {
            long seconds = LoginSecurityManager.getRemainLockTimeForUser(coolStuffUser.getEmail());
            throw new CustomException(ResultCodeEnum.ACCOUNT_LOCKED, seconds);
        }

        if (LoginSecurityManager.isIpUserLocked(clientIp, coolStuffUser.getEmail())) {
            long sec = LoginSecurityManager.getRemainLockTimeForIpUser(clientIp, coolStuffUser.getEmail());
            throw new CustomException(ResultCodeEnum.ACCOUNT_LOCKED, sec);
        }



        CoolStuffUser dbCoolStuffUser = coolStuffUserMapper.selectByUsername(coolStuffUser.getEmail());
        if (ObjectUtil.isNull(dbCoolStuffUser)) {
            LoginSecurityManager.recordFailForIpUser(clientIp, coolStuffUser.getEmail());
            LoginSecurityManager.recordFailForIp(clientIp, coolStuffUser.getEmail());
            LoginSecurityManager.recordFailForUser(coolStuffUser.getEmail(), clientIp);
            throw new CustomException(ResultCodeEnum.USER_NOT_EXIST_ERROR);
        }

        String password = securePassword(coolStuffUser.getPassword());
        System.out.println(password);
        System.out.println(dbCoolStuffUser.getPassword());
        if (!dbCoolStuffUser.getPassword().equals(password)) {
            LoginSecurityManager.recordFailForIpUser(clientIp, coolStuffUser.getEmail());
            LoginSecurityManager.recordFailForIp(clientIp, coolStuffUser.getEmail());
            LoginSecurityManager.recordFailForUser(coolStuffUser.getEmail(), clientIp);
            throw new CustomException(ResultCodeEnum.USER_ACCOUNT_ERROR);
        }

        stpLogicCoolUser.login(dbCoolStuffUser.getId());
        String token = stpLogicCoolUser.getTokenValue();
        dbCoolStuffUser.setToken(token);


        LoginSecurityManager.clearIpUserFailRecord(clientIp, coolStuffUser.getEmail());
        LoginSecurityManager.clearUserFailRecord(coolStuffUser.getEmail());
        LoginSecurityManager.clearIpFailRecord(clientIp);


        AsyncTaskFactory.recordLog(LogModuleEnum.USER.value,"登陆 " + stpLogicCoolUser.loginType , dbCoolStuffUser.getId() );
        return dbCoolStuffUser;
    }

    /**
     * 修改密码
     */
    public void updatePassword(CoolStuffUser coolStuffUser) {
        System.out.println(coolStuffUser);
        CoolStuffUser dbCoolStuffUser = coolStuffUserMapper.selectByUsername(coolStuffUser.getUsername());
        if (ObjectUtil.isNull(dbCoolStuffUser)) {
            throw new CustomException(ResultCodeEnum.USER_NOT_EXIST_ERROR);
        }
        if (!securePassword(coolStuffUser.getPassword()).equals(dbCoolStuffUser.getPassword())) {
            throw new CustomException(ResultCodeEnum.PARAM_PASSWORD_ERROR);
        }
        dbCoolStuffUser.setPassword(securePassword(coolStuffUser.getNewPassword()));
        coolStuffUserMapper.updatePassword(dbCoolStuffUser.getUsername(),dbCoolStuffUser.getPassword());
        //coolStuffUserMapper.updateById(dbCoolStuffUser);


        AsyncTaskFactory.recordLog(LogModuleEnum.USER.value,"修改密码", dbCoolStuffUser.getId() );
    }

    /**
     * 密码加密
     */
    private String securePassword(String password) {
        return SecureUtil.md5(password + Constants.PASSWORD_SALT);
    }

    private CoolStuffUser selectByGoogleId(String googleId){
        return coolStuffUserMapper.selectByGoogleId(googleId);
    }

    public Map<String, Object> googleLogin(GoogleUserDTO googleUserDTO) {

        CoolStuffUser existingUser = selectByGoogleId(googleUserDTO.getGoogleId());

        CoolStuffUser coolStuffUser;
        if (ObjectUtil.isNotNull(existingUser)) {
            // 已存在用户，直接使用
            coolStuffUser = existingUser;
        } else {
            // 创建新用户
            coolStuffUser = new CoolStuffUser();
            coolStuffUser.setUsername(googleUserDTO.getName() + "_" + UUID.randomUUID().toString().substring(0, 8));
            coolStuffUser.setEmail(googleUserDTO.getEmail());
            coolStuffUser.setGoogleId(googleUserDTO.getGoogleId());
            coolStuffUser.setLoginType(1); // 标记为Google登录
            coolStuffUser.setStatus(1);    // 启用账号
            add(coolStuffUser);
            AsyncTaskFactory.recordLog(LogModuleEnum.USER.value,"google注册", coolStuffUser.getId() );
        }
        stpLogicCoolUser.login(coolStuffUser.getId());
        String token = stpLogicCoolUser.getTokenValue();

        // 返回用户信息和令牌
        Map<String, Object> response = new HashMap<>();
        response.put("code", "200");

        Map<String, Object> data = new HashMap<>();
        data.put("id", coolStuffUser.getId());
        data.put("username", coolStuffUser.getUsername());
        data.put("token", token);
        // 可加入其他需要的用户信息


        response.put("data", data);
        return response;
    }
}