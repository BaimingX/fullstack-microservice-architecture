package com.example.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.entity.User;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

import java.util.List;

public interface UserMapper extends BaseMapper<User> {


    User selectByUsername(String username);

    void deleteById(Integer id);

    User selectById(Integer id);

    List<User> selectAll(User user);

    @Update("update user set password = #{newPassword} where username = #{username}")
    void updatePassword(@Param("username") String username, @Param("newPassword") String newPassword);


}
