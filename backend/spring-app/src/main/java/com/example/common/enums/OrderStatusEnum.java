package com.example.common.enums;

public enum OrderStatusEnum {
    CANCEL("Cancelled"),
    NOT_PAY("Pending Payment"),
    NOT_SEND("Pending Shipment"),
    DISPATCHED("Dispatched"),
    DONE("Completed"),
    REFUND_DONE("Refunded"),
    COMMENT_DONE("Reviewed");

    public String value;

    OrderStatusEnum(String value) {
        this.value = value;
    }
}
