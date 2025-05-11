package com.example.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.List;

@Data
@TableName("user")
public class User {

    /** ID */
    @TableId(type = IdType.AUTO)
    private Integer id;
    /** 账号 */
    private String username;
    /** 密码 */
    private String password;
    /** 名称 */
    private String name;
    /** 头像 */
    private String avatar;
    /** 角色标识 */
    private Integer roleId;
    /** 性别 */
    private String sex;
    /** 年龄 */
    private String age;
    /** 电话 */
    private String phone;
    /** 邮箱 */
    private String email;

    // 角色唯一标识
    @TableField(exist = false)
    private String role;
    // 角色名称
    @TableField(exist = false)
    private String roleName;
    // token数据
    @TableField(exist = false)
    private String token;
    // 修改密码-新密码
    @TableField(exist = false)
    private String newPassword;
    // 菜单路由列表
    @TableField(exist = false)
    private List<Menu> menus;

    @TableField(exist = false)
    private List<Site> sites;

    private String uuid;
    private String code;

}
