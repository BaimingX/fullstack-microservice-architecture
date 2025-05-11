package com.example.mapper;

import com.example.entity.OrderDetail;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrderDetailMapper {

    List<OrderDetail> selectByOrderId(@Param("orderId") Integer orderId);

    int insertBatch(@Param("list") List<OrderDetail> list);

    int deleteByOrderId(@Param("orderId") Integer orderId);
}