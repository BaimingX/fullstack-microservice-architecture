package com.example.controller;

import com.example.common.Result;
import com.example.entity.stripe.StripeWebhook;
import com.example.service.StripeService;
import jakarta.annotation.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

/**
 * 专门处理Stripe Webhook回调的控制器
 * 由于nginx配置将/api/路径映射到根路径/，所以/api/stripe/webhook实际会请求/stripe/webhook
 */
@RestController
public class StripeWebhookController {
    private static final Logger logger = LoggerFactory.getLogger(StripeWebhookController.class);

    @Resource
    private StripeService stripeService;

    /**
     * 处理来自Stripe的webhook回调
     * 外部完整路径: /api/stripe/webhook
     * 内部路径: /stripe/webhook
     */
    @PostMapping("/stripe/webhook")
    public Result handleWebhook(@RequestBody String payload,
                                @RequestHeader("Stripe-Signature") String sigHeader) {
        logger.info("收到Stripe Webhook回调 - 路径: /stripe/webhook");
        try {
            boolean processed = stripeService.handleWebhook(payload, sigHeader);
            logger.info("Stripe Webhook处理结果: {}", processed);
            return Result.success(new StripeWebhook(processed));
        } catch (Exception e) {
            logger.error("处理Stripe webhook失败", e);
            return Result.error("8500", "处理支付回调失败：" + e.getMessage());
        }
    }
}
