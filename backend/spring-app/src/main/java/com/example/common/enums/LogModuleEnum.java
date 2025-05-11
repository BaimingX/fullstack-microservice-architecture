package com.example.common.enums;

public enum LogModuleEnum {
    USER("用户"),
    ORDERS("订单");

    public String value;

    LogModuleEnum(String value){
        this.value = value;
    }
}
