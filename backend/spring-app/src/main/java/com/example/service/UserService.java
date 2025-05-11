package com.example.service;

import cn.dev33.satoken.stp.StpLogic;
import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.ObjectUtil;
import cn.hutool.crypto.SecureUtil;
import com.example.common.Constants;
import com.example.common.enums.LogModuleEnum;
import com.example.common.enums.ResultCodeEnum;
import com.example.common.system.AsyncTaskFactory;
import com.example.entity.Menu;
import com.example.entity.Site;
import com.example.entity.User;
import com.example.exception.CustomException;
import com.example.mapper.UserMapper;
import com.example.security.LoginSecurityManager;
import com.example.utils.IpUtils;
import com.example.utils.RedisUtils;
import com.example.utils.SaUtils;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import jakarta.annotation.Resource;

import org.springframework.stereotype.Service;

import java.util.List;


/**
 * 用户业务处理
 **/
@Service
public class UserService {

    @Resource
    private UserMapper userMapper;

    @Resource
    private RoleService roleService;

    @Resource
    private StpLogic stpLogicBackendUser;

    /**
     * 新增
     */
    public void add(User user) {

        if (ObjectUtil.isEmpty(user.getUsername())) {
            throw new CustomException("400","账号不能为空");
        }
        if (ObjectUtil.isEmpty(user.getRole())) {
            throw new CustomException("400","角色不能为空");
        }
        User dbUser = userMapper.selectByUsername(user.getUsername());
        if (ObjectUtil.isNotNull(dbUser)) {
            throw new CustomException(ResultCodeEnum.USER_EXIST_ERROR);
        }
        if (ObjectUtil.isEmpty(user.getPassword())) {
            user.setPassword(securePassword(Constants.USER_DEFAULT_PASSWORD));
        }else {
            user.setPassword(securePassword(user.getPassword()));
        }
        if (ObjectUtil.isEmpty(user.getName())) {
            user.setName(user.getUsername());
        }


        userMapper.insert(user);
    }

    /**
     * 删除
     */
    public void deleteById(Integer id) {
        userMapper.deleteById(id);
    }

    /**
     * 批量删除
     */
    public void deleteBatch(List<Integer> ids) {
        for (Integer id : ids) {
            userMapper.deleteById(id);
        }
    }

    /**
     * 修改
     */
    public void updateById(User user) {
        userMapper.updateById(user);
    }

    /**
     * 根据ID查询
     */
    public User selectById(Integer id) {
        return userMapper.selectById(id);
    }

    /**
     * 查询所有
     */
    public List<User> selectAll(User user) {
        return userMapper.selectAll(user);
    }

    /**
     * 分页查询
     */
    public PageInfo<User> selectPage(User user, Integer pageNum, Integer pageSize) {
        PageHelper.startPage(pageNum, pageSize);
        List<User> list = userMapper.selectAll(user);
        return PageInfo.of(list);
    }

    /**
     * 注册
     */
    public void register(User user) {
        add(user);
        AsyncTaskFactory.recordLog(LogModuleEnum.USER.value,"注册", user.getId() );
    }

    public User login(User user) {
        // ========== 1. 校验验证码 ==========
        String uuid = user.getUuid();
        String captchaKey = Constants.REDIS_KEY_CAPTCHA + uuid;
        String captchaCode = RedisUtils.getCacheObject(captchaKey);
        if (captchaCode == null){
            throw new CustomException(ResultCodeEnum.CAPTCHA_EXPIRED_ERROR);
        }
        if (!user.getCode().equals(captchaCode)){
            throw new CustomException(ResultCodeEnum.CAPTCHA_CALCULATE_ERROR);
        }

        RedisUtils.deleteObject(captchaKey);

        // ========== A. 先获取客户端IP ==========
        String clientIp = IpUtils.getIpAddr();

        // ========== B. 检查IP是否已被锁定 ==========
        if (LoginSecurityManager.isIpLocked(clientIp)) {
            long seconds = LoginSecurityManager.getRemainLockTimeForIp(clientIp);
            throw new CustomException(ResultCodeEnum.ACCOUNT_LOCKED, seconds);
        }

        // ========== C. 检查用户名是否已被锁定 ==========
        if (LoginSecurityManager.isUserLocked(user.getUsername())) {
            long seconds = LoginSecurityManager.getRemainLockTimeForUser(user.getUsername());
            throw new CustomException(ResultCodeEnum.ACCOUNT_LOCKED, seconds);
        }

        if (LoginSecurityManager.isIpUserLocked(clientIp, user.getUsername())) {
            long sec = LoginSecurityManager.getRemainLockTimeForIpUser(clientIp, user.getUsername());
            throw new CustomException(ResultCodeEnum.ACCOUNT_LOCKED, sec);
        }

        // ========== 3. 查询用户 ==========
        User dbUser = userMapper.selectByUsername(user.getUsername());
        if (ObjectUtil.isNull(dbUser)) {
            LoginSecurityManager.recordFailForIpUser(clientIp, user.getUsername());
            LoginSecurityManager.recordFailForIp(clientIp, user.getUsername());
            LoginSecurityManager.recordFailForUser(user.getUsername(), clientIp);
            throw new CustomException(ResultCodeEnum.USER_NOT_EXIST_ERROR);
        }
        // ========== 4. 核对密码 ==========
        String password = securePassword(user.getPassword());
        System.out.println(password);
        System.out.println(dbUser.getPassword());
        if (!dbUser.getPassword().equals(password)) {
            LoginSecurityManager.recordFailForIpUser(clientIp, user.getUsername());
            LoginSecurityManager.recordFailForIp(clientIp, user.getUsername());
            LoginSecurityManager.recordFailForUser(user.getUsername(), clientIp);
            throw new CustomException(ResultCodeEnum.USER_ACCOUNT_ERROR);
        }

        // ========== 5. 成功 => 清除失败记录 ==========
        LoginSecurityManager.clearIpUserFailRecord(clientIp, user.getUsername());
        LoginSecurityManager.clearUserFailRecord(user.getUsername());
        LoginSecurityManager.clearIpFailRecord(clientIp);

        // ========== 6. 后续登录逻辑（Sa-Token） ==========
        //StpUtil.login(dbUser.getId());
        stpLogicBackendUser.login(dbUser.getId());

        String token = stpLogicBackendUser.getTokenValue();
        dbUser.setToken(token);


        // 查询用户对应角色的菜单列表
        System.out.println("当前用户 ID：" + dbUser);
        System.out.println("当前用户角色 ID：" + dbUser.getRoleId());

        List<Menu> menus = roleService.selectUserMenus(dbUser.getRoleId());
        List<Site> sites = roleService.selectUserSite(dbUser.getRoleId());
        // 打印菜单数据
        System.out.println("用户菜单数据：" + menus);
        System.out.println("用户站点数据：" + sites);


        dbUser.setMenus(menus);
        dbUser.setSites(sites);



        AsyncTaskFactory.recordLog(LogModuleEnum.USER.value,"登陆 "+stpLogicBackendUser.loginType, dbUser.getId() );
        return dbUser;
    }

    /**
     * 修改密码
     */
    public void updatePassword(User user) {
        System.out.println(user);
        User dbUser = userMapper.selectByUsername(user.getUsername());
        if (ObjectUtil.isNull(dbUser)) {
            throw new CustomException(ResultCodeEnum.USER_NOT_EXIST_ERROR);
        }
        if (!securePassword(user.getPassword()).equals(dbUser.getPassword())) {
            throw new CustomException(ResultCodeEnum.PARAM_PASSWORD_ERROR);
        }
        dbUser.setPassword(securePassword(user.getNewPassword()));
        userMapper.updatePassword(dbUser.getUsername(),dbUser.getPassword());
        //userMapper.updateById(dbUser);


        AsyncTaskFactory.recordLog(LogModuleEnum.USER.value,"修改密码", dbUser.getId() );
    }

    /**
     * 密码加密
     */
    private String securePassword(String password) {
        return SecureUtil.md5(password + Constants.PASSWORD_SALT);
    }


    
}