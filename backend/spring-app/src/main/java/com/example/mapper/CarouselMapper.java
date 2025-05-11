package com.example.mapper;

import com.example.entity.Carousel;

import java.util.List;

public interface CarouselMapper {

    void insert(Carousel carousel);

    void deleteById(Integer id);

    void updateById(Carousel carousel);

    Carousel selectById(Integer id);

    List<Carousel> selectAll(Carousel carousel);

}
