package com.example.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.List;

@Data
@TableName("role")
public class Role {

    /** ID */
    @TableId(type = IdType.AUTO)
    private Integer id;
    /** 角色名称 */
    private String name;
    /** 唯一标识 */
    private String flag;

    @TableField(exist = false)
    private List<Integer> menuIds;

    @TableField(exist = false)
    private List<Integer> siteIds;
}
