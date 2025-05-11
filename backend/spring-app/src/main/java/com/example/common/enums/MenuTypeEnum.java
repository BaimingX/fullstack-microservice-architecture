package com.example.common.enums;

public enum MenuTypeEnum {
    FOLDER("Directory"),
    PAGE("Menu"),
    SITE("Site");

    public String value;

    MenuTypeEnum(String value) {
        this.value = value;
    }
}
