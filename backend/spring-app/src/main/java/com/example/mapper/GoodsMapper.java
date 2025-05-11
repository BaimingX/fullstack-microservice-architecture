package com.example.mapper;

import com.example.entity.Goods;

import java.util.List;

public interface GoodsMapper {

    void insert(Goods goods);

    void deleteById(Integer id);

    void updateById(Goods goods);

    Goods selectById(Integer id);

    List<Goods> selectAll(Goods goods);

    List<Goods> selectAllOrderById(Goods goods);
}
