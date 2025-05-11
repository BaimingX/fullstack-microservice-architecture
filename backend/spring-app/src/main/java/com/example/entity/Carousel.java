package com.example.entity;

import lombok.Data;

@Data
public class Carousel {
    private Integer id;
    private Integer goodsId;
    private String img;
    private String mediaType;

    private String goodsName;
    private Integer siteId;
}
