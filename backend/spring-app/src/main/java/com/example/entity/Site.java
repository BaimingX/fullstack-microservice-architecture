package com.example.entity;

import lombok.Data;

@Data
public class Site {
    private Integer id;
    private String name;
    private String domain;
    private String logo;
    private String description;

    // 省略 Getter、Setter
}
