package com.example.service;

import cn.hutool.core.util.IdUtil;
import com.example.common.Constants;
import com.example.common.enums.LogModuleEnum;
import com.example.common.enums.OrderStatusEnum;
import com.example.common.system.AsyncTaskFactory;
import com.example.entity.CoolStuffUser;
import com.example.entity.Goods;
import com.example.entity.OrderDetail;
import com.example.entity.OrderMain;
import com.example.exception.CustomException;
import com.example.mapper.OrderDetailMapper;
import com.example.mapper.OrderMainMapper;
import com.example.utils.SaUtils;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.revinate.guava.util.concurrent.RateLimiter;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OrderMainService implements InitializingBean {

    @Resource
    private OrderMainMapper orderMainMapper;
    @Resource
    private OrderDetailMapper orderDetailMapper;
    @Resource
    private GoodsService goodsService;

    private static final ConcurrentHashMap<Integer,Object> orderMap = new ConcurrentHashMap<>();

    private RateLimiter limiter;

    /**
     * 新增
     */
    @Transactional
    public OrderMain createOrderCoolStuff(OrderMain orderMain) {
        limiter.acquire();
        CoolStuffUser loginCoolStuffUser = SaUtils.getLoginCoolStuffUser();

        Object lock = orderMap.computeIfAbsent(loginCoolStuffUser.getId(), k -> new Object());

        synchronized (lock){
            orderMain.setUserId(loginCoolStuffUser.getId());
            orderMain.setStatus(OrderStatusEnum.NOT_PAY.value);
            orderMain.setSiteId(1);
            String orderNo = IdUtil.getSnowflakeNextIdStr();
            orderMain.setOrderNo(orderNo);

            BigDecimal totalPrice = BigDecimal.ZERO;
            List<OrderDetail> details = orderMain.getOrderDetails();
            if (details == null || details.isEmpty()) {
                throw new CustomException("8080","订单明细不能为空");
            }

            for (OrderDetail detail : details) {
                // 从数据库查询商品信息（如果需要动态获取商品名称、价格等）
                Goods dbGoods = goodsService.selectById(detail.getGoodsId());
                if (dbGoods == null) {
                    throw new CustomException("商品不存在，ID=" + detail.getGoodsId());
                }
                if (getOrderType(dbGoods).equals("Flash Price")){
                    int flashStore = dbGoods.getFlashNum() - detail.getNum();
                    if (flashStore < 0 ) {
                        throw new CustomException("秒杀商品已抢完");
                    }
                    dbGoods.setFlashNum(flashStore);
                }
                // 计算商品单价
                BigDecimal realPrice = getRealPrice(dbGoods);
                // 这里可以根据是否打折/秒杀，返回实际价格

                // 设置明细

                detail.setGoodsName(dbGoods.getName());
                detail.setGoodsImg(dbGoods.getImg());
                detail.setGoodsPrice(realPrice);
                detail.setType(detail.getType());
                detail.setUrl(dbGoods.getUrl());
                detail.setOrderType(getOrderType(dbGoods));
                // 小计: realPrice * detail.num
                BigDecimal sub = realPrice.multiply(BigDecimal.valueOf(detail.getNum()));
                detail.setSubtotal(sub);


                totalPrice = totalPrice.add(sub);
            }
            // 先插入订单主表，获取ID
            orderMainMapper.insert(orderMain);

            // 为所有订单详情设置订单ID
            for (OrderDetail detail : details) {
                detail.setOrderId(orderMain.getId());
            }

            // 再插入订单详情
            orderDetailMapper.insertBatch(details);
        }


        AsyncTaskFactory.recordLog(LogModuleEnum.ORDERS.value, "创建订单,订单编号: ["+orderMain.getOrderNo() +"]", loginCoolStuffUser.getId());
        orderMap.remove(loginCoolStuffUser.getId());
        return orderMain;
    }


    @Transactional
    public OrderMain updateOrderCoolStuff(OrderMain orderMain,String orderNo) {
        limiter.acquire();
        CoolStuffUser loginCoolStuffUser = SaUtils.getLoginCoolStuffUser();

        // Verify the order belongs to the current user
        OrderMain existingOrder = orderMainMapper.selectByOrderNo(orderNo);
        if (existingOrder == null) {
            throw new CustomException("8081", "订单不存在");
        }

        if (!existingOrder.getUserId().equals(loginCoolStuffUser.getId())) {
            throw new CustomException("8082", "无权限修改此订单");
        }

        // Only allow updates for orders that haven't been paid
        if (!OrderStatusEnum.NOT_PAY.value.equals(existingOrder.getStatus())) {
            throw new CustomException("8083", "已支付订单不能修改");
        }

        Object lock = orderMap.computeIfAbsent(loginCoolStuffUser.getId(), k -> new Object());

        synchronized (lock) {
            // Update shipping address information
            existingOrder.setAddressLine1(orderMain.getAddressLine1());
            existingOrder.setAddressLine2(orderMain.getAddressLine2());
            existingOrder.setSuburb(orderMain.getSuburb());
            existingOrder.setState(orderMain.getState());
            existingOrder.setPostalCode(orderMain.getPostalCode());
            existingOrder.setCountry(orderMain.getCountry());

            // Update order details if provided
            List<OrderDetail> updatedDetails = orderMain.getOrderDetails();
            if (updatedDetails != null && !updatedDetails.isEmpty()) {
                // Delete existing order details
                orderDetailMapper.deleteByOrderId(existingOrder.getId());

                // Recalculate total price
                BigDecimal totalPrice = BigDecimal.ZERO;

                for (OrderDetail detail : updatedDetails) {
                    // Get product information from database
                    Goods dbGoods = goodsService.selectById(detail.getGoodsId());
                    if (dbGoods == null) {
                        throw new CustomException("商品不存在，ID=" + detail.getGoodsId());
                    }

                    // Check flash sale inventory if applicable
                    if (getOrderType(dbGoods).equals("Flash Price")) {
                        int flashStore = dbGoods.getFlashNum() - detail.getNum();
                        if (flashStore < 0) {
                            throw new CustomException("秒杀商品已抢完");
                        }
                        dbGoods.setFlashNum(flashStore);
                    }

                    // Calculate item price
                    BigDecimal realPrice = getRealPrice(dbGoods);

                    // Set details
                    detail.setOrderId(existingOrder.getId());
                    detail.setGoodsName(dbGoods.getName());
                    detail.setGoodsImg(dbGoods.getImg());
                    detail.setGoodsPrice(realPrice);
                    detail.setType(detail.getType());
                    detail.setUrl(dbGoods.getUrl());
                    detail.setOrderType(getOrderType(dbGoods));

                    // Calculate subtotal
                    BigDecimal sub = realPrice.multiply(BigDecimal.valueOf(detail.getNum()));
                    detail.setSubtotal(sub);

                    totalPrice = totalPrice.add(sub);
                }

                // Update total price
                existingOrder.setTotalPrice(totalPrice);

                // Insert updated order details
                orderDetailMapper.insertBatch(updatedDetails);
            } else if (orderMain.getTotalPrice() != null) {
                // If no details but total price provided, update it
                existingOrder.setTotalPrice(orderMain.getTotalPrice());
            }

            // Update the order in database
            orderMainMapper.updateById(existingOrder);

            return existingOrder;
        }
    }



    // ========== 根据商品信息决定实际售价 ==========
    private BigDecimal getRealPrice(Goods goods) {
        // 1. 先获取当前时间
        LocalDateTime now = LocalDateTime.now();

        // 2. 如果商品开启了秒杀，并且 flashTime 不为空，判断时间是否还没过期
        if (Boolean.TRUE.equals(goods.getHasFlash()) && goods.getFlashPrice() != null && goods.getFlashTime() != null) {
            try {
                // 2.1 将字符串解析成 LocalDateTime（假设你的时间格式是 "yyyy-MM-dd HH:mm:ss"）
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                LocalDateTime flashEndTime = LocalDateTime.parse(goods.getFlashTime(), formatter);

                // 2.2 判断当前时间是否在秒杀截止时间之前
                if (now.isBefore(flashEndTime) && goods.getFlashNum()>0) {
                    // 秒杀还未结束，使用秒杀价
                    return goods.getFlashPrice();
                }
            } catch (DateTimeParseException e) {
                // 解析异常，默认不使用秒杀价，下面继续判断
                e.printStackTrace();
            }
        }

        // 3. 如果商品有折扣，并且折扣价不为空，则使用折扣价
        if (Boolean.TRUE.equals(goods.getHasDiscount()) && goods.getDiscountPrice() != null) {
            return goods.getDiscountPrice();
        }

        // 4. 否则使用原价
        return goods.getOriginPrice();
    }





    private String getOrderType(Goods goods) {

        // 1. 先获取当前时间
        LocalDateTime now = LocalDateTime.now();

        // 2. 如果商品开启了秒杀，并且 flashTime 不为空，判断时间是否还没过期
        if (Boolean.TRUE.equals(goods.getHasFlash()) && goods.getFlashPrice() != null && goods.getFlashTime() != null) {
            try {
                // 2.1 将字符串解析成 LocalDateTime（假设你的时间格式是 "yyyy-MM-dd HH:mm:ss"）
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                LocalDateTime flashEndTime = LocalDateTime.parse(goods.getFlashTime(), formatter);

                // 2.2 判断当前时间是否在秒杀截止时间之前
                if (now.isBefore(flashEndTime) && goods.getFlashNum()>0) {
                    // 秒杀还未结束，使用秒杀价
                    return "Flash Price";
                }
            } catch (DateTimeParseException e) {
                // 解析异常，默认不使用秒杀价，下面继续判断
                e.printStackTrace();
            }
        }

        // 3. 如果商品有折扣，并且折扣价不为空，则使用折扣价
        if (Boolean.TRUE.equals(goods.getHasDiscount()) && goods.getDiscountPrice() != null) {
            return "Discount Price";
        }

        // 4. 否则使用原价
        return "Origin Price";
    }

    /**
     * 删除
     */
    public void deleteById(Integer id) {
        orderMainMapper.deleteById(id);
    }

    /**
     * 批量删除
     */
    public void deleteBatch(List<Integer> ids) {
        for (Integer id : ids) {
            orderMainMapper.deleteById(id);
        }
    }

    /**
     * 修改
     */
    public void updateById(OrderMain orderMain) {
        orderMainMapper.updateById(orderMain);
    }

    /**
     * 根据ID查询
     */
    public OrderMain selectById(Integer id) {
        return orderMainMapper.selectById(id);
    }

    /**
     * 查询所有
     */
    public List<OrderMain> selectAll(OrderMain orderMain) {
        List<OrderMain> list = siteSelect(orderMain);

        return list;
    }

    /**
     * 分页查询
     */
    public PageInfo<OrderMain> selectPage(OrderMain orderMain, Integer pageNum, Integer pageSize) {
        PageHelper.startPage(pageNum, pageSize);
        List<OrderMain> list = siteSelect(orderMain);

        return PageInfo.of(list);
    }

    private List<OrderMain> siteSelect(OrderMain orderMain) {
        List<OrderMain> list;
        Integer siteId = orderMain.getSiteId();
        if (siteId != null) {
            switch (siteId) {
                case 1:
                    list = orderMainMapper.selectAllCoolStuff(orderMain);
                    break;

                default:
                    throw new IllegalArgumentException("Unsupported siteId: " + siteId);
            }
        } else {
            throw new IllegalArgumentException("siteId is required");
        }
        return list;
    }



    @Override
    public void afterPropertiesSet() throws Exception {
        limiter = RateLimiter.create(Constants.ORDER_LIMIT_NUM);
    }

    public OrderMain selectByOrderNo(String orderNo) {
        return orderMainMapper.selectByOrderNo(orderNo);
    }

    public List<OrderMain> selectAllByCoolStuffUser(Integer userId,Integer siteId) {
        return orderMainMapper.selectAllByCoolStuffUser(userId,siteId);
    }
}
