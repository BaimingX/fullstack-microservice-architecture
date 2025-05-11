package com.example.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.entity.Role;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface RoleMapper extends BaseMapper<Role> {

    void deleteById(Integer id);

    Role selectById(Integer id);

    @Select("select * from role where flag = #{flag}")
    Role selectByFlag(String flag);

    List<Role> selectAll(Role role);

}
