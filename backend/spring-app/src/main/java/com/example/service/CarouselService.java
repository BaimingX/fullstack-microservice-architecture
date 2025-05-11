package com.example.service;

import com.example.entity.Carousel;
import com.example.mapper.CarouselMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarouselService {

    @Resource
    private CarouselMapper carouselMapper;

    /**
     * 新增
     */
    public void add(Carousel Carousel) {

        carouselMapper.insert(Carousel);
    }

    /**
     * 删除
     */
    public void deleteById(Integer id) {
        carouselMapper.deleteById(id);
    }

    /**
     * 批量删除
     */
    public void deleteBatch(List<Integer> ids) {
        for (Integer id : ids) {
            carouselMapper.deleteById(id);
        }
    }

    /**
     * 修改
     */
    public void updateById(Carousel Carousel) {
        carouselMapper.updateById(Carousel);
    }

    /**
     * 根据ID查询
     */
    public Carousel selectById(Integer id) {
        return carouselMapper.selectById(id);
    }

    /**
     * 查询所有
     */
    public List<Carousel> selectAll(Carousel Carousel) {
        return carouselMapper.selectAll(Carousel);
    }

    /**
     * 分页查询
     */
    public PageInfo<Carousel> selectPage(Carousel Carousel, Integer pageNum, Integer pageSize) {
        PageHelper.startPage(pageNum, pageSize);
        List<Carousel> list = carouselMapper.selectAll(Carousel);
        return PageInfo.of(list);
    }

}
