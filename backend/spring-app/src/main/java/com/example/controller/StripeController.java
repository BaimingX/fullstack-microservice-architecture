package com.example.controller;

import com.example.common.Result;
import com.example.entity.stripe.PaymentIntentDTO;
import com.example.entity.stripe.StripeWebhook;
import com.example.service.StripeService;
import com.stripe.exception.StripeException;
// 明确导入Stripe SDK的PaymentIntent类
import com.stripe.model.PaymentIntent;
import jakarta.annotation.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/stripe")
public class StripeController {
    private static final Logger logger = LoggerFactory.getLogger(StripeController.class);

    @Resource
    private StripeService stripeService;

    // 创建结账会话
    @PostMapping("/checkout-session")
    public Result createCheckoutSession(@RequestBody Map<String, String> request) {
        try {
            String orderNo = request.get("orderNo");
            Map<String, String> session = stripeService.createCheckoutSession(orderNo);
            return Result.success(session);
        } catch (StripeException e) {
            logger.error("创建Stripe结账会话失败", e);
            return Result.error("8500", "创建支付会话失败：" + e.getMessage());
        }
    }

    // 创建支付意向
    @PostMapping("/payment-intent")
    public Result createPaymentIntent(@RequestBody Map<String, String> request) {
        try {
            String orderNo = request.get("orderNo");
            // 明确使用Stripe SDK的PaymentIntent
            PaymentIntent paymentIntent = stripeService.createPaymentIntent(orderNo);
            return Result.success(new PaymentIntentDTO(paymentIntent.getClientSecret()));
        } catch (StripeException e) {
            logger.error("创建Stripe支付意向失败", e);
            return Result.error("8500", "创建支付意向失败：" + e.getMessage());
        }
    }

    // 处理Stripe Webhook回调
    // @PostMapping("/webhook")
    // public Result handleWebhook(@RequestBody String payload,
    //                             @RequestHeader("Stripe-Signature") String sigHeader) {
    //     try {
    //         boolean processed = stripeService.handleWebhook(payload, sigHeader);
    //         return Result.success(new StripeWebhook(processed));
    //     } catch (Exception e) {
    //         logger.error("处理Stripe webhook失败", e);
    //         return Result.error("8500", "处理支付回调失败：" + e.getMessage());
    //     }
    // }
}