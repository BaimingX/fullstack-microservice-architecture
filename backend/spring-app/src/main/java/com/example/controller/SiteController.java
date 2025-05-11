package com.example.controller;

import com.example.common.Result;
import com.example.entity.Site;
import com.example.service.SiteService;
import com.github.pagehelper.PageInfo;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/site")
public class SiteController {

    @Resource
    SiteService siteService;

    /**
     * 新增
     */
    @PostMapping("/add")
    public Result add(@RequestBody Site site) {
        siteService.add(site);
        return Result.success();
    }

    /**
     * 删除
     */
    @DeleteMapping("/delete/{id}")
    public Result delete(@PathVariable Integer id) {
        siteService.deleteById(id);
        return Result.success();
    }

    /**
     * 批量删除
     */
    @DeleteMapping("/delete/batch")
    public Result delete(@RequestBody List<Integer> ids) {
        siteService.deleteBatch(ids);
        return Result.success();
    }

    /**
     * 新增
     */
    @PutMapping("/update")
    public Result update(@RequestBody Site site) {
        System.out.println("Update"+site);
        siteService.updateById(site);
        return Result.success();
    }

    /**
     * 查询单个
     */
    @GetMapping("/selectById/{id}")
    public Result selectById(@PathVariable Integer id) {
        Site site = siteService.selectById(id);
        return Result.success(site);
    }

    /**
     * 查询所有
     */
    @GetMapping("/selectAll")
    public Result selectAll(Site site) {
        List<Site> list = siteService.selectAll(site);
        return Result.success(list);
    }

    /**
     * 查询所有
     */
    @GetMapping("/selectPage")
    public Result selectPage(
            Site site,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PageInfo<Site> pageInfo = siteService.selectPage(site, pageNum, pageSize);
        return Result.success(pageInfo);
    }

}
