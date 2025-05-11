package com.example.service;

import com.example.common.enums.OrderStatusEnum;
import com.example.entity.OrderDetail;
import com.example.entity.OrderMain;
import com.example.exception.CustomException;
import com.example.mapper.OrderMainMapper;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class StripeService {
    private static final Logger logger = LoggerFactory.getLogger(StripeService.class);

    @Resource
    private OrderMainMapper orderMainMapper;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Value("${app.frontend-url:https://auscoolstuff.com.au}")
    private String frontendUrl;

    // 将BigDecimal转换为Stripe所需的long（单位：分）
    private long toStripeCurrency(BigDecimal amount) {
        return amount.multiply(new BigDecimal("100")).longValue();
    }

    // 创建Stripe结账会话
    public Map<String, String> createCheckoutSession(String orderNo) throws StripeException {
        // 查询订单信息
        OrderMain orderMain = orderMainMapper.selectByOrderNo(orderNo);
        if (orderMain == null) {
            throw new CustomException("8404", "订单不存在");
        }

        if (!OrderStatusEnum.NOT_PAY.value.equals(orderMain.getStatus())) {
            throw new CustomException("8400", "订单状态不正确，无法支付");
        }

        // 构建Session参数
        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/order/" + orderNo + "?success=true")
                .setCancelUrl(frontendUrl + "/order/" + orderNo + "?canceled=true");

        // 添加订单中的商品项
        for (OrderDetail detail : orderMain.getOrderDetails()) {
            paramsBuilder.addLineItem(
                    SessionCreateParams.LineItem.builder()
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("aud")
                                            .setUnitAmount(toStripeCurrency(detail.getGoodsPrice()))
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName(detail.getGoodsName())
                                                            .setDescription(detail.getType() + " - " + detail.getOrderType())
                                                            .addImage(detail.getGoodsImg())
                                                            .build()
                                            )
                                            .build()
                            )
                            .setQuantity((long) detail.getNum())
                            .build()
            );
        }

        // 添加订单元数据
        paramsBuilder.putMetadata("orderNo", orderNo);

        // 创建会话
        Session session = Session.create(paramsBuilder.build());

        // 返回会话ID和URL
        Map<String, String> result = new HashMap<>();
        result.put("sessionId", session.getId());
        result.put("url", session.getUrl());

        return result;
    }

    // 创建支付意向
    public PaymentIntent createPaymentIntent(String orderNo) throws StripeException {
        // 查询订单信息
        OrderMain orderMain = orderMainMapper.selectByOrderNo(orderNo);
        if (orderMain == null) {
            throw new CustomException("8404", "订单不存在");
        }

        if (!OrderStatusEnum.NOT_PAY.value.equals(orderMain.getStatus())) {
            throw new CustomException("8400", "订单状态不正确，无法支付");
        }

        // 创建支付意向
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(toStripeCurrency(orderMain.getTotalPrice()))
                .setCurrency("aud")
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .putMetadata("orderNo", orderNo)
                .build();

        return PaymentIntent.create(params);
    }

    // 处理Stripe Webhook
    public boolean handleWebhook(String payload, String sigHeader) {
        logger.info("开始处理Stripe Webhook，签名头长度: {}", sigHeader != null ? sigHeader.length() : 0);
        try {
            // 验证签名
            logger.info("正在验证webhook签名...");
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            logger.info("签名验证成功，事件类型: {}, 事件ID: {}", event.getType(), event.getId());
            
            // 处理不同类型的事件
            switch (event.getType()) {
                case "checkout.session.completed":
                    logger.info("检测到checkout.session.completed事件，开始处理...");
                    handleCheckoutSessionCompleted(event);
                    break;
                case "payment_intent.succeeded":
                    logger.info("检测到payment_intent.succeeded事件，开始处理...");
                    handlePaymentIntentSucceeded(event);
                    break;
                default:
                    logger.info("未处理的事件类型: {}", event.getType());
            }
            
            logger.info("Webhook处理完成");
            return true;
            
        } catch (SignatureVerificationException e) {
            logger.error("⚠️ Webhook签名验证失败: {}", e.getMessage(), e);
            throw new CustomException("8400", "Webhook签名验证失败: " + e.getMessage());
        } catch (Exception e) {
            logger.error("处理webhook事件失败: {}", e.getMessage(), e);
            throw new CustomException("8500", "处理webhook事件失败: " + e.getMessage());
        }
    }

    // 处理结账会话完成事件
    private void handleCheckoutSessionCompleted(Event event) {
        logger.info("开始处理checkout.session.completed事件...");
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        logger.info("获取数据对象反序列化器");
        
        StripeObject stripeObject = dataObjectDeserializer.getObject().orElse(null);
        logger.info("反序列化结果: {}", stripeObject != null ? stripeObject.getClass().getSimpleName() : "null");
        
        if (stripeObject instanceof Session) {
            logger.info("stripeObject是Session类型，开始提取数据");
            Session session = (Session) stripeObject;
            String orderNo = session.getMetadata().get("orderNo");
            String paymentIntentId = session.getPaymentIntent();
            
            logger.info("从Session中提取 - orderNo: {}, paymentIntentId: {}", orderNo, paymentIntentId);
            
            if (orderNo != null) {
                logger.info("orderNo有效，开始更新订单状态");
                updateOrderPaid(orderNo, paymentIntentId);
            } else {
                logger.warn("orderNo为空，无法更新订单");
            }
        } else {
            logger.warn("无法处理的对象类型: {}", stripeObject != null ? stripeObject.getClass().getName() : "null");
        }
        logger.info("checkout.session.completed事件处理完成");
    }

    // 处理支付意向成功事件
    private void handlePaymentIntentSucceeded(Event event) {
        logger.info("开始处理payment_intent.succeeded事件...");
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        logger.info("获取数据对象反序列化器");
        
        if (dataObjectDeserializer.getObject().isPresent()) {
            logger.info("成功反序列化事件数据");
            StripeObject stripeObject = dataObjectDeserializer.getObject().get();
            logger.info("反序列化结果: {}", stripeObject != null ? stripeObject.getClass().getSimpleName() : "null");
            
            if (stripeObject instanceof PaymentIntent) {
                logger.info("stripeObject是PaymentIntent类型，开始提取数据");
                PaymentIntent paymentIntent = (PaymentIntent) stripeObject;
                String orderNo = paymentIntent.getMetadata().get("orderNo");
                String paymentIntentId = paymentIntent.getId();
                
                logger.info("从PaymentIntent中提取 - orderNo: {}, paymentIntentId: {}", orderNo, paymentIntentId);
                
                if (orderNo != null) {
                    logger.info("orderNo有效，开始更新订单状态");
                    updateOrderPaid(orderNo, paymentIntentId);
                } else {
                    logger.warn("orderNo为空，无法更新订单");
                }
            } else {
                logger.warn("无法处理的对象类型: {}", stripeObject != null ? stripeObject.getClass().getName() : "null");
                tryExtractFromRawEventData(event);
            }
        } else {
            logger.warn("无法反序列化事件数据，尝试从原始事件数据中获取订单信息");
            tryExtractFromRawEventData(event);
        }
        
        logger.info("payment_intent.succeeded事件处理完成");
    }

    // 从原始事件数据中提取orderNo
    private void tryExtractFromRawEventData(Event event) {
        try {
            logger.info("尝试从原始事件数据中提取订单信息");
            
            // 直接从事件对象获取数据
            String paymentIntentId = null;
            String orderNo = null;
            
            // 获取事件的数据对象
            StripeObject object = event.getData().getObject();
            if (object != null) {
                logger.info("成功获取事件对象: {}", object.getClass().getSimpleName());
                
                if (object instanceof PaymentIntent) {
                    PaymentIntent paymentIntent = (PaymentIntent) object;
                    paymentIntentId = paymentIntent.getId();
                    orderNo = paymentIntent.getMetadata().get("orderNo");
                    logger.info("从PaymentIntent对象中提取数据 - paymentIntentId: {}, orderNo: {}", paymentIntentId, orderNo);
                } else {
                    // 尝试直接访问对象的id和metadata字段
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        Map<String, Object> dataMap = mapper.readValue(object.toJson(), Map.class);
                        
                        paymentIntentId = (String) dataMap.get("id");
                        
                        @SuppressWarnings("unchecked")
                        Map<String, String> metadata = (Map<String, String>) dataMap.get("metadata");
                        if (metadata != null) {
                            orderNo = metadata.get("orderNo");
                        }
                        
                        logger.info("从通用对象中提取数据 - paymentIntentId: {}, orderNo: {}", paymentIntentId, orderNo);
                    } catch (Exception e) {
                        logger.warn("从通用对象提取数据失败: {}", e.getMessage());
                    }
                }
                
                // 如果获取到了必要的信息，更新订单状态
                if (paymentIntentId != null && orderNo != null) {
                    logger.info("成功提取订单信息，开始更新订单状态");
                    updateOrderPaid(orderNo, paymentIntentId);
                    return;
                }
            }
            
            logger.warn("无法从事件对象中提取有效的订单信息");
        } catch (Exception e) {
            logger.error("从事件数据提取订单信息失败: {}", e.getMessage(), e);
        }
    }

    // 更新订单为已支付状态
    private void updateOrderPaid(String orderNo, String paymentIntentId) {
        logger.info("开始更新订单支付状态 - orderNo: {}, paymentIntentId: {}", orderNo, paymentIntentId);
        
        OrderMain orderMain = orderMainMapper.selectByOrderNo(orderNo);
        logger.info("查询订单结果: {}", orderMain != null ? "订单存在" : "订单不存在");
        
        if (orderMain != null) {
            logger.info("当前订单状态: {}", orderMain.getStatus());
            
            if (OrderStatusEnum.NOT_PAY.value.equals(orderMain.getStatus())) {
                logger.info("订单状态为未支付，准备更新状态");
                
                // 更新订单状态为待发货
                orderMain.setStatus(OrderStatusEnum.NOT_SEND.value);
                orderMain.setPayNo(paymentIntentId);
                orderMain.setPayTime(LocalDateTime.now());
                
                int updateResult = orderMainMapper.updateById(orderMain);
                logger.info("更新订单状态结果: {}", updateResult > 0 ? "成功" : "失败");
                
                logger.info("订单 {} 支付成功，已更新状态为待发货", orderNo);
            } else {
                logger.warn("订单 {} 状态不正确，当前状态: {}", orderNo, orderMain.getStatus());
            }
        } else {
            logger.warn("订单 {} 不存在", orderNo);
        }
        
        logger.info("订单支付状态更新处理完成");
    }
}