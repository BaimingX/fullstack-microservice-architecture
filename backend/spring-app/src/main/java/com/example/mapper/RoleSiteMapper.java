package com.example.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;

import com.example.entity.RoleSite;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface RoleSiteMapper extends BaseMapper<RoleSite> {

    @Delete("delete from role_site where role_id = #{roleId}")
    void deleteByRoleId(Integer roleId);

    @Insert("insert into role_site (role_id, site_id) values (#{roleId}, #{siteId})")
    void insert(@Param("roleId") Integer roleId, @Param("siteId") Integer siteId);

    @Select("select site_id from role_site where role_id = #{roleId}")
    List<Integer> selectByRoleId(Integer roleId);

}
