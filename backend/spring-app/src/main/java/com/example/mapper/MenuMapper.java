package com.example.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.entity.Menu;
import java.util.List;

/**
 * 操作menu相关数据接口
 */
public interface MenuMapper extends BaseMapper<Menu> {

    /**
     * 删除
     */
    int deleteById(Integer id);

    /**
     * 根据ID查询
     */
    Menu selectById(Integer id);

    /**
     * 查询所有
     */
    List<Menu> selectAll(Menu menu);

}