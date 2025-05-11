package com.example.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.entity.CoolStuffUser;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

import java.util.List;

public interface CoolStuffUserMapper extends BaseMapper<CoolStuffUser> {


    CoolStuffUser selectByUsername(String coolStuffUsername);

    void deleteById(Integer id);

    CoolStuffUser selectById(Integer id);

    List<CoolStuffUser> selectAll(CoolStuffUser coolStuffUser);

    @Update("update coolStuffUser set password = #{newPassword} where coolStuffUsername = #{coolStuffUsername}")
    void updatePassword(@Param("coolStuffUsername") String coolStuffUsername, @Param("newPassword") String newPassword);


    CoolStuffUser selectByGoogleId(String googleId);

    CoolStuffUser selectByEmail(String email);
}
