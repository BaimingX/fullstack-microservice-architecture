package com.example.controller;

import com.example.common.Result;
import com.example.entity.Goods;
import com.example.entity.OrderMain;
import com.example.service.OrderMainService;
import com.example.service.EmailService;
import com.github.pagehelper.PageInfo;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;
import com.example.utils.SaUtils;
import java.util.List;
import java.util.Map;
import com.example.entity.User;

@RestController
@RequestMapping("/orderMain")
public class OrderMainController {

    @Resource
    OrderMainService orderMainService;

    @Resource
    EmailService  emailService;

    /**
     * 发送订单邮件
     */
    @PostMapping("/sendEmail")
    public Result sendEmail(@RequestBody Map<String, String> mailData) {
        try {
            String to = mailData.get("to");
            String subject = mailData.get("subject");
            String content = mailData.get("content");
            
            // 验证必要字段
            if (to == null || subject == null || content == null) {
                return Result.error("400", "邮件收件人、主题或内容不能为空");
            }
            
            // 调用邮件服务发送邮件
            boolean sent = emailService.sendEmail(to, subject, content);
            
            if (sent) {
                return Result.success("邮件发送成功");
            } else {
                return Result.error("500", "邮件发送失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("500", "邮件发送异常：" + e.getMessage());
        }
    }

    /**
     * 新增
     */

//    @PostMapping("/createCoolStuffOrder")
//    public Result createCoolStuffOrder(@RequestBody OrderMain orderMain) {
//        OrderMain savedOrderMain = orderMainService.createOrderCoolStuff(orderMain);
//        return Result.success(savedOrderMain);
//    }


    /**
     * 删除
     */
    @DeleteMapping("/delete/{id}")
    public Result delete(@PathVariable Integer id) {
        orderMainService.deleteById(id);
        return Result.success();
    }

    /**
     * 批量删除
     */
    @DeleteMapping("/delete/batch")
    public Result delete(@RequestBody List<Integer> ids) {
        orderMainService.deleteBatch(ids);
        return Result.success();
    }

    /**
     * 新增
     */
    @PutMapping("/update")
    public Result update(@RequestBody OrderMain orderMain) {
        // 尝试获取登录用户，如果失败则返回错误结果
        User loginUser;
        try {
            loginUser = SaUtils.getLoginUser();
        } catch (Exception e) {
            return Result.error("未登录或登录已过期");
        }

        if (loginUser == null) {
            return Result.error("未登录或登录已过期");
        }
        
        // 如果获取到了登录用户，继续执行后续逻辑
        System.out.println("Update"+orderMain);
        orderMainService.updateById(orderMain);
        return Result.success();
    }

    /**
     * 查询单个
     */
    @GetMapping("/selectById/{id}")
    public Result selectById(@PathVariable Integer id) {
        OrderMain orderMain = orderMainService.selectById(id);
        return Result.success(orderMain);
    }

    /**
     * 查询所有
     */
    @GetMapping("/selectAll")
    public Result selectAll(OrderMain orderMain) {
        List<OrderMain> list = orderMainService.selectAll(orderMain);
        return Result.success(list);
    }

    /**
     * 查询所有
     */
    @GetMapping("/selectPage")
    public Result selectPage(
            OrderMain orderMain,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PageInfo<OrderMain> pageInfo = orderMainService.selectPage(orderMain, pageNum, pageSize);
        return Result.success(pageInfo);
    }

}
