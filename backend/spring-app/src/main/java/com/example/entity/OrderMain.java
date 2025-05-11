package com.example.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderMain {


    private Integer id;

    private String orderNo;

    private Integer userId;

    private BigDecimal totalPrice = BigDecimal.ZERO;

    private String status;

    private String payNo;

    private LocalDateTime createTime;

    private LocalDateTime payTime;

    private List<OrderDetail> orderDetails;

    private Integer siteId;
    private String username;

    // Shipping address fields
    private String addressLine1;

    private String addressLine2;

    private String suburb;

    private String state;

    private String postalCode;

    private String country;

    private String userEmail;

}
