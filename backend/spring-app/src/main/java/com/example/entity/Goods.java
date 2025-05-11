package com.example.entity;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class Goods {
    private Integer id;
    private  String name;
    private BigDecimal originPrice;

    private  Boolean hasDiscount;
    private  BigDecimal discountPrice;
    private  Boolean hasFlash;
    private  BigDecimal flashPrice;

    private  String content;
    private  String img;
    private  Integer categoryId;
    private  String date;
    private  Integer store;
    private  String flashTime;
    private  Integer flashNum;
    private  String  url;
    private  String  type;

    private  String categoryName;
    private  Integer siteId;
}
