package com.example.service;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.map.MapUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.example.common.enums.MenuTypeEnum;
import com.example.entity.Menu;
import com.example.entity.Role;

import com.example.entity.Site;
import com.example.mapper.RoleMapper;
import com.example.mapper.RoleMenuMapper;
import com.example.mapper.RoleSiteMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 管理员业务处理
 **/
@Service
public class RoleService {

    @Resource
    private RoleMapper roleMapper;

    @Resource
    private RoleMenuMapper roleMenuMapper;

    @Resource
    private RoleSiteMapper roleSiteMapper;

    @Resource
    private MenuService menuService;

    @Resource
    private SiteService siteService;
    /**
     * 新增
     */
    public void add(Role role) {
        roleMapper.insert(role);
        this.setRoleMenu(role.getId(), role.getMenuIds());
        this.setRoleSite(role.getId(), role.getSiteIds());
    }

    /**
     * 删除
     */
    @Transactional
    public void deleteById(Integer id) {
        roleMapper.deleteById(id);
        roleMenuMapper.deleteByRoleId(id);
    }

    /**
     * 批量删除
     */
    public void deleteBatch(List<Integer> ids) {
        for (Integer id : ids) {
            this.deleteById(id);
        }
    }

    /**
     * 修改
     */
    public void updateById(Role role) {
        roleMapper.updateById(role);
        this.setRoleMenu(role.getId(), role.getMenuIds());
        this.setRoleSite(role.getId(), role.getSiteIds());
    }

    /**
     * 根据ID查询
     */
    public Role selectById(Integer id) {
        return roleMapper.selectById(id);
    }

    /**
     * 查询所有
     */
    public List<Role> selectAll(Role role) {
        return roleMapper.selectAll(role);
    }

    /**
     * 分页查询
     */
    public PageInfo<Role> selectPage(Role role, Integer pageNum, Integer pageSize) {
        PageHelper.startPage(pageNum, pageSize);
        List<Role> list = this.selectAll(role);
        for (Role r : list) {
            List<Integer> menuIds = roleMenuMapper.selectByRoleId(r.getId());
            r.setMenuIds(menuIds);
            List<Integer> siteIds = roleSiteMapper.selectByRoleId(r.getId());
            r.setSiteIds(siteIds);
        }
        return PageInfo.of(list);
    }

    // 设置角色和菜单的关系
    @Transactional
    public void setRoleMenu(Integer roleId, List<Integer> menuIds) {
        if (CollUtil.isEmpty(menuIds)) {
            return;
        }
        roleMenuMapper.deleteByRoleId(roleId);
        for (Integer menuId : menuIds) {
            roleMenuMapper.insert(roleId, menuId);
        }
    }

    @Transactional
    public void setRoleSite(Integer roleId, List<Integer> SiteIds) {
        if (CollUtil.isEmpty(SiteIds)) {
            return;
        }
        roleSiteMapper.deleteByRoleId(roleId);
        for (Integer siteId : SiteIds) {
            roleSiteMapper.insert(roleId, siteId);
        }
    }

    /**
     * 查询角色的菜单树
     */
    public List<Menu> selectUserMenus(Integer roleId) {
        Role role = roleMapper.selectById(roleId);
        List<Integer> menuIds = roleMenuMapper.selectByRoleId(role.getId());
        List<Menu> menuList = new ArrayList<>();
        for (Integer menuId : menuIds) {
            Menu menu = menuService.selectById(menuId);
            menuList.add(menu);
        }
        return menuService.getMenus(menuList);
    }

    public List<Site> selectUserSite(Integer roleId) {
        Role role = roleMapper.selectById(roleId);
        List<Integer> siteIds = roleSiteMapper.selectByRoleId(role.getId());
        List<Site> siteList = new ArrayList<>();
        for (Integer siteId : siteIds) {
            Site site = siteService.selectById(siteId);
            siteList.add(site);
        }
        return siteList;
    }

}