package com.example.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.List;

/**
 * 菜单信息表
 */
@Data
@TableName("menu")
public class Menu {

    /** ID */
    @TableId(type = IdType.AUTO)
    private Integer id;
    /** 菜单名称 */
    private String name;
    /** 图标 */
    private String icon;
    /** 排序 */
    private Integer sort;
    /** 菜单类型 */
    private String type;
    /** 组件路径 */
    private String path;
    /** 上级菜单ID */
    private Integer pid;

    @TableField(exist = false)
    private List<Menu> children;
    @TableField(exist = false)
    private String parent;

}