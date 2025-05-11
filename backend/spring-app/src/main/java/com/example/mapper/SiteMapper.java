package com.example.mapper;

import com.example.entity.Site;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface SiteMapper {

    List<Site> selectAll(Site site);

    Site selectById(Integer id);

    int insert(Site site);

    int updateById(Site site);

    int deleteById(Integer id);

    // 其他定制方法...
}
