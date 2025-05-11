package com.example.entity;


import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * 字典表
 */
@Data
@TableName("dict")
public class Dict {

    /** ID */
    @TableId(type = IdType.AUTO)
    private Integer id;
    /** 名称 */
    private String name;
    /** 内容 */
    private String value;
    /** 类型 */
    private String type;

}