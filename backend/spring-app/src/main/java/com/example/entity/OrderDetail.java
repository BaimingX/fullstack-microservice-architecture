package com.example.entity;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderDetail {
    private Integer id;
    private Integer goodsId;
    private Integer orderId;
    private String goodsName;
    private String goodsImg;
    private BigDecimal goodsPrice;
    private Integer num;
    private BigDecimal subtotal;
    private String url;
    private String type;
    private String orderType;
}
