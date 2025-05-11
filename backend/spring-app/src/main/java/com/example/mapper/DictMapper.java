package com.example.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.entity.Dict;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface DictMapper extends BaseMapper<Dict> {

    @Select("select * from dict where type = #{type}")
    List<Dict> selectByType(String type);

}
