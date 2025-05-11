package com.example.mapper;

import com.example.entity.OrderMain;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrderMainMapper {

    OrderMain selectById(@Param("id") Integer id);

    //List<OrderMain> selectAll(OrderMain orderMain);

    List<OrderMain> selectAllCoolStuff(OrderMain orderMain);

    int insert(OrderMain orderMain);

    int updateById(OrderMain orderMain);

    int deleteById(@Param("id") Integer id);

    OrderMain selectByOrderNo(@Param("orderNo") String orderNo);

    List<OrderMain> selectAllByCoolStuffUser(Integer userId, Integer siteId);
}