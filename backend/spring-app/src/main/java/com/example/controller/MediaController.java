package com.example.controller;

import com.example.common.Result;
import com.example.entity.GoodsMedia;
import com.example.mapper.GoodsMediaMapper;
import jakarta.annotation.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/media")
public class MediaController {
    @Resource
    private GoodsMediaMapper goodsMediaMapper;

    @GetMapping("/goods/{goodsId}")
    public ResponseEntity<?> listMedia(@PathVariable Integer goodsId) {
        List<GoodsMedia> list = goodsMediaMapper.findByGoodsId(goodsId);
        
        // 设置缓存控制头，允许CDN和浏览器缓存1小时
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(3600, TimeUnit.SECONDS)
                        .mustRevalidate())
                .body(Result.success(list));
    }

    // ... 如果需要单独删除media
    @DeleteMapping("/{id}")
    public Result deleteMedia(@PathVariable Integer id) {
        goodsMediaMapper.deleteById(id);
        return Result.success();
    }
}
