package com.example.controller;

import com.example.common.Result;
import com.example.entity.Logs;
import com.example.service.LogsService;
import com.github.pagehelper.PageInfo;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/logs")
public class LogsController {

    @Resource
    LogsService logsService;

    /**
     * 新增
     */
    @PostMapping("/add")
    public Result add(@RequestBody Logs logs) {
        logsService.add(logs);
        return Result.success();
    }

    /**
     * 删除
     */
    @DeleteMapping("/delete/{id}")
    public Result delete(@PathVariable Integer id) {
        logsService.deleteById(id);
        return Result.success();
    }

    /**
     * 批量删除
     */
    @DeleteMapping("/delete/batch")
    public Result delete(@RequestBody List<Integer> ids) {
        logsService.deleteBatch(ids);
        return Result.success();
    }

    /**
     * 新增
     */
    @PutMapping("/update")
    public Result update(@RequestBody Logs logs) {
        System.out.println("Update"+logs);
        logsService.updateById(logs);
        return Result.success();
    }

    /**
     * 查询单个
     */
    @GetMapping("/selectById/{id}")
    public Result selectById(@PathVariable Integer id) {
        Logs logs = logsService.selectById(id);
        return Result.success(logs);
    }

    /**
     * 查询所有
     */
    @GetMapping("/selectAll")
    public Result selectAll(Logs logs) {
        List<Logs> list = logsService.selectAll(logs);
        return Result.success(list);
    }

    /**
     * 查询所有
     */
    @GetMapping("/selectPage")
    public Result selectPage(
            Logs logs,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        PageInfo<Logs> pageInfo = logsService.selectPage(logs, pageNum, pageSize);
        return Result.success(pageInfo);
    }

}
