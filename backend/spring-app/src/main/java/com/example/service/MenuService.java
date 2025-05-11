package com.example.service;

import cn.hutool.core.util.ObjectUtil;
import com.example.common.enums.MenuTypeEnum;
import com.example.entity.Menu;
import com.example.mapper.MenuMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;

import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 菜单信息表业务处理
 **/
@Service
public class MenuService {

    @Resource
    private MenuMapper menuMapper;

    /**
     * 新增
     */
    public void add(Menu menu) {
        menuMapper.insert(menu);
    }

    /**
     * 删除
     */
    public void deleteById(Integer id) {
        menuMapper.deleteById(id);
    }

    /**
     * 批量删除
     */
    public void deleteBatch(List<Integer> ids) {
        for (Integer id : ids) {
            menuMapper.deleteById(id);
        }
    }

    /**
     * 修改
     */
    public void updateById(Menu menu) {
        menuMapper.updateById(menu);
    }

    /**
     * 根据ID查询
     */
    public Menu selectById(Integer id) {
        return menuMapper.selectById(id);
    }

    /**
     * 查询所有
     */
    public List<Menu> selectAll(Menu menu) {
        return menuMapper.selectAll(menu);
    }

    /**
     * 分页查询
     */
    public PageInfo<Menu> selectPage(Menu menu, Integer pageNum, Integer pageSize) {
        PageHelper.startPage(pageNum, pageSize);
        List<Menu> list = menuMapper.selectAll(menu);
        return PageInfo.of(list);
    }

    /**
     * 查询菜单权限树
     */
    public List<Menu> selectTree() {
        // 先查询所有节点
        List<Menu> menuList = menuMapper.selectAll(null);
        // 再构建树
        return getMenus(menuList);
    }

    public List<Menu> selectFolder() {
        return menuMapper.selectAll(null).stream()
                .filter(menu ->
                        MenuTypeEnum.SITE.value.equals(menu.getType()) || MenuTypeEnum.FOLDER.value.equals(menu.getType())
                )
                .toList();

    }

    public List<Menu> getMenus(List<Menu> menuList) {
        List<Menu> menuTree = menuList.stream().filter(menu -> ObjectUtil.isNotEmpty(menu) && (MenuTypeEnum.FOLDER.value.equals(menu.getType()) || MenuTypeEnum.SITE.value.equals(menu.getType()))).toList();
        menuTree = menuTree.stream().sorted(Comparator.comparing(Menu::getSort)).toList();
        menuTree.forEach(menu -> {
            List<Menu> children = menuList.stream().filter(m -> ObjectUtil.isNotEmpty(m) && menu.getId().equals(m.getPid())).toList();
            children = children.stream().sorted(Comparator.comparing(Menu::getSort)).toList();
            menu.setChildren(children);
        });
        return menuTree;
    }

}