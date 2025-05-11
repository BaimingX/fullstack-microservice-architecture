package com.example.controller;

import com.example.common.Result;
import com.example.entity.Dict;
import com.example.service.DictService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/dict")
public class DictController {

    @Resource
    DictService dictService;

    @GetMapping("/selectByType")
    public Result selectByType(@RequestParam String type) {
        List<Dict> list = dictService.selectByType(type);
        return Result.success(list);
    }

}
