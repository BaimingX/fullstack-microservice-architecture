package com.example.controller;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.ObjectUtil;
import com.example.common.Result;
import com.example.common.enums.SiteIdEnum;
import com.example.entity.CoolStuffUser;
import com.example.entity.GoogleUserDTO;
import com.example.entity.OrderMain;
import com.example.entity.User;
import com.example.service.CoolStuffUserService;
import com.example.service.OrderMainService;
import com.example.utils.SaUtils;
import com.github.pagehelper.PageInfo;
import jakarta.annotation.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/coolStuffUser")
public class CoolStuffUserController {

    @Resource
    OrderMainService orderMainService;

    @Resource
    CoolStuffUserService coolStuffUserService;

    /**
     * 新增
     */
    @PostMapping("/add")
    public Result add(@RequestBody CoolStuffUser coolStuffUser) {
        coolStuffUserService.add(coolStuffUser);
        return Result.success();
    }

    @PostMapping("/register")
    public Result register(@RequestBody CoolStuffUser coolStuffUser, String codeFromUser) {
        coolStuffUserService.register(coolStuffUser,codeFromUser);
        return Result.success();
    }

    @PostMapping("/sendEmailCode")
    public Result sendEmailCode(@RequestBody CoolStuffUser coolStuffUser) {
        coolStuffUserService.sendEmailCode(coolStuffUser);
        return Result.success();
    }

    /**
     * 删除
     */
    @DeleteMapping("/delete/{id}")
    public Result delete(@PathVariable Integer id) {
        coolStuffUserService.deleteById(id);
        return Result.success();
    }

    /**
     * 批量删除
     */
    @DeleteMapping("/delete/batch")
    public Result delete(@RequestBody List<Integer> ids) {
        coolStuffUserService.deleteBatch(ids);
        return Result.success();
    }

    /**
     * 新增
     */
    @PutMapping("/update")
    public Result update(@RequestBody CoolStuffUser coolStuffUser) {
        System.out.println("Update"+coolStuffUser);
        coolStuffUserService.updateById(coolStuffUser);
        return Result.success();
    }

    /**
     * 查询单个
     */
    @GetMapping("/selectById/{id}")
    public Result selectById(@PathVariable Integer id) {
        CoolStuffUser coolStuffUser = coolStuffUserService.selectById(id);
        return Result.success(coolStuffUser);
    }

    /**
     * 查询所有
     */
    @GetMapping("/selectAll")
    public Result selectAll(CoolStuffUser coolStuffUser) {
        List<CoolStuffUser> list = coolStuffUserService.selectAll(coolStuffUser);
        return Result.success(list);
    }

    /**
     * 查询所有
     */
    @GetMapping("/selectPage")
    public Result selectPage(
            CoolStuffUser coolStuffUser,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PageInfo<CoolStuffUser> pageInfo = coolStuffUserService.selectPage(coolStuffUser, pageNum, pageSize);
        return Result.success(pageInfo);
    }

    @PostMapping("/login")
    public Result login(@RequestBody CoolStuffUser coolStuffUser) {
        CoolStuffUser coolStuffUserData = coolStuffUserService.login(coolStuffUser);
        return Result.success(coolStuffUserData);
    }

    @PostMapping("/oauth/google")
    public ResponseEntity<Map<String, Object>> handleGoogleLogin(@RequestBody GoogleUserDTO googleUserDTO) {

        Map<String, Object> response = coolStuffUserService.googleLogin(googleUserDTO);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/createCoolStuffOrder")
    public Result createCoolStuffOrder(@RequestBody OrderMain orderMain) {
        OrderMain savedOrderMain = orderMainService.createOrderCoolStuff(orderMain);
        return Result.success(savedOrderMain);
    }

    @PostMapping("/updateOrder/{orderNo}")
    public Result updateOrder(@RequestBody OrderMain orderMain,@PathVariable String orderNo) {
        OrderMain savedOrderMain = orderMainService.updateOrderCoolStuff(orderMain,orderNo);
        return Result.success(savedOrderMain);
    }

    @GetMapping("/selectByOrderNo/{orderNo}")
    public Result selectByOrderNo(@PathVariable String orderNo) {
        CoolStuffUser loginUser = SaUtils.getLoginCoolStuffUser();
        if (loginUser == null) {
            return Result.error("401", "User not logged in");
        }
        OrderMain orderMain = orderMainService.selectByOrderNo(orderNo);
        if (orderMain == null) {
            return Result.error("404", "Order not found");
        }

        // 4. 验证订单是否属于当前登录用户
        if (!orderMain.getUserId().equals(loginUser.getId())) {
            return Result.error("403", "Access denied to this order");
        }

        return Result.success(orderMain);
    }

    @GetMapping("/selectAllOrderByUser")
    public Result selectAllOrderByCoolUser(){
        CoolStuffUser loginUser = SaUtils.getLoginCoolStuffUser();
        if (loginUser == null) {
            return Result.error("401", "User not logged in");
        }
        Integer siteId = SiteIdEnum.CoolStuff.id;
        List<OrderMain> orderMainList = orderMainService.selectAllByCoolStuffUser(loginUser.getId(),siteId);

        return Result.success(orderMainList);
    }

}
