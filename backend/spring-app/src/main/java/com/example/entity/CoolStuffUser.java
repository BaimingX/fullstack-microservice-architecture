package com.example.entity;


import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Data
@TableName("cool_stuff_user")
public class CoolStuffUser {

    @TableId(type = IdType.AUTO)
    private Integer id;
    private String username;
    private String password;

    private String googleId;

    private Integer loginType = 0; // 0 = 本地, 1 = Google

    private String nickname;

    private String avatar;

    private String phone;

    private String email;

    private String addressLine1;

    private String addressLine2;

    private String suburb;

    private String state;

    private String postalCode;

    private String country;

    private Integer status = 1; // 1 = 启用, 0 = 禁用

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    @PrePersist
    protected void onCreate() {
        this.createTime = LocalDateTime.now();
        this.updateTime = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updateTime = LocalDateTime.now();
    }

    @TableField(exist = false)
    private String newPassword;

    @TableField(exist = false)
    private String token;

    private String coolStuffUserName;


}
