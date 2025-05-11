package com.example.service;

import com.example.entity.Site;
import com.example.mapper.SiteMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SiteService {

    @Resource
    private SiteMapper siteMapper;

    /**
     * 新增
     */
    public void add(Site site) {
        System.out.println(site);
        siteMapper.insert(site);
    }

    /**
     * 删除
     */
    public void deleteById(Integer id) {
        siteMapper.deleteById(id);
    }

    /**
     * 批量删除
     */
    public void deleteBatch(List<Integer> ids) {
        for (Integer id : ids) {
            siteMapper.deleteById(id);
        }
    }

    /**
     * 修改
     */
    public void updateById(Site site) {
        siteMapper.updateById(site);
    }

    /**
     * 根据ID查询
     */
    public Site selectById(Integer id) {
        return siteMapper.selectById(id);
    }

    /**
     * 查询所有
     */
    public List<Site> selectAll(Site Site) {
        return siteMapper.selectAll(Site);
    }

    /**
     * 分页查询
     */
    public PageInfo<Site> selectPage(Site site, Integer pageNum, Integer pageSize) {
        PageHelper.startPage(pageNum, pageSize);
        List<Site> list = siteMapper.selectAll(site);
        return PageInfo.of(list);
    }

}
