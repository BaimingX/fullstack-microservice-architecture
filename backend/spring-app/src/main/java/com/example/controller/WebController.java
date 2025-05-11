package com.example.controller;

import cn.hutool.core.codec.Base64;
import cn.hutool.core.util.IdUtil;
import com.example.common.Constants;
import com.example.common.Result;
import com.example.entity.User;
import com.example.service.UserService;
import com.example.utils.RedisUtils;
import com.google.code.kaptcha.Producer;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.FastByteArrayOutputStream;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@Slf4j
public class WebController {

    @Resource
    UserService userService;

    @Resource
    private Producer producer;

    /**
     * 默认请求接口
     */
    @GetMapping("/")
    public Result hello() {
        return Result.success();
    }

    /**
     * 登录
     */
    @PostMapping("/login")
    public Result login(@RequestBody User user) {
        User userData = userService.login(user);
        return Result.success(userData);
    }

    /**
     * 注册
    
    @PostMapping("/register")
    public Result register(@RequestBody User user) {
        userService.register(user);
        return Result.success();
    }
    */

    /**
     * 修改密码
     */
    @PutMapping("/updatePassword")
    public Result updatePassword(@RequestBody User user) {
        userService.updatePassword(user);
        return Result.success();
    }

    /**
     * 验证码
     */
    @GetMapping("/captcha")
    public Result getCaptcha(){
        String uuid = IdUtil.fastUUID();
        String captchaKey = Constants.REDIS_KEY_CAPTCHA + uuid;

        String captchaText = producer.createText();
        String captchaStr = captchaText.substring(0,captchaText.lastIndexOf("@"));
        String captchaCode = captchaText.substring(captchaText.lastIndexOf("@") + 1);
        RedisUtils.setCacheObject(captchaKey,captchaCode,Constants.CAPTCHA_EXPIRE_MINUTES, TimeUnit.MINUTES);

        try(FastByteArrayOutputStream outputStream = new FastByteArrayOutputStream();) {
            BufferedImage image = producer.createImage(captchaStr);
            ImageIO.write(image,"jpg",outputStream);

            Map<String, Object> map = new HashMap<>();
            map.put("uuid", uuid);
            map.put("img", Base64.encode(outputStream.toByteArray()));
            return Result.success(map);
        }catch (Exception e) {
            log.error("生成验证码错误");
            return Result.error("生成验证码错误");
        }

    }

}
