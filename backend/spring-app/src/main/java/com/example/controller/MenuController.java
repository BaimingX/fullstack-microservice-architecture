package com.example.controller;

import com.example.common.Result;
import com.example.entity.Menu;
import com.example.service.MenuService;
import com.github.pagehelper.PageInfo;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 菜单信息表前端操作接口
 **/
@RestController
@RequestMapping("/menu")
public class MenuController {

    @Resource
    private MenuService menuService;

    /**
     * 新增
     */
    @PostMapping("/add")
    public Result add(@RequestBody Menu menu) {
        menuService.add(menu);
        return Result.success();
    }

    /**
     * 删除
     */
    @DeleteMapping("/delete/{id}")
    public Result deleteById(@PathVariable Integer id) {
        menuService.deleteById(id);
        return Result.success();
    }

    /**
     * 批量删除
     */
    @DeleteMapping("/delete/batch")
    public Result deleteBatch(@RequestBody List<Integer> ids) {
        menuService.deleteBatch(ids);
        return Result.success();
    }

    /**
     * 修改
     */
    @PutMapping("/update")
    public Result updateById(@RequestBody Menu menu) {
        menuService.updateById(menu);
        return Result.success();
    }

    /**
     * 根据ID查询
     */
    @GetMapping("/selectById/{id}")
    public Result selectById(@PathVariable Integer id) {
        Menu menu = menuService.selectById(id);
        return Result.success(menu);
    }

    /**
     * 查询所有
     */
    @GetMapping("/selectAll")
    public Result selectAll(Menu menu) {
        List<Menu> list = menuService.selectAll(menu);
        return Result.success(list);
    }

    /**
     * 分页查询
     */
    @GetMapping("/selectPage")
    public Result selectPage(Menu menu,
                             @RequestParam(defaultValue = "1") Integer pageNum,
                             @RequestParam(defaultValue = "10") Integer pageSize) {
        PageInfo<Menu> page = menuService.selectPage(menu, pageNum, pageSize);
        return Result.success(page);
    }

    /**
     * 查询菜单树
     */
    @GetMapping("/selectTree")
    public Result selectAll() {
        List<Menu> list = menuService.selectTree();
        return Result.success(list);
    }

    /**
     * 查询目录
     */
    @GetMapping("/selectFolder")
    public Result selectFolder() {
        List<Menu> list = menuService.selectFolder();
        return Result.success(list);
    }

}