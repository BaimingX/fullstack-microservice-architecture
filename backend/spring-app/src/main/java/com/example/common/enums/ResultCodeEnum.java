package com.example.common.enums;

public enum ResultCodeEnum {
    SUCCESS("200", "Success"),

    PARAM_ERROR("400", "Parameter error"),
    TOKEN_INVALID_ERROR("401", "Invalid token"),
    TOKEN_CHECK_ERROR("401", "Token verification failed, please log in again"),
    PARAM_LOST_ERROR("4001", "Missing parameter"),

    SYSTEM_ERROR("500", "System error"),
    USER_EXIST_ERROR("5001", "Username already exists"),
    USER_NOT_LOGIN("5002", "User not logged in"),
    USER_ACCOUNT_ERROR("5003", "Incorrect username or password"),
    USER_NOT_EXIST_ERROR("5004", "User does not exist"),
    PARAM_PASSWORD_ERROR("5005", "Incorrect original password"),
    CAPTCHA_EXPIRED_ERROR("5006", "Captcha expired"),
    CAPTCHA_CALCULATE_ERROR("5007", "Incorrect captcha"),
    ACCOUNT_LOCKED("5008", "This account has been locked. Please try again after {0} seconds.");


    ;

    public String code;
    public String msg;

    ResultCodeEnum(String code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public String getCode() {
        return code;
    }

    public String formatMessage(Object... args) {
        return java.text.MessageFormat.format(msg, args);
    }
}
