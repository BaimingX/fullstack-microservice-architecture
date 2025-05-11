package com.example.service;

import com.example.entity.Logs;
import com.example.mapper.LogsMapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.List;


/**
 * 用户业务处理
 **/
@Service
public class LogsService {

    @Resource
    private LogsMapper logsMapper;

    /**
     * 新增
     */
    public void add(Logs Logs) {

        logsMapper.insert(Logs);
    }

    /**
     * 删除
     */
    public void deleteById(Integer id) {
        logsMapper.deleteById(id);
    }

    /**
     * 批量删除
     */
    public void deleteBatch(List<Integer> ids) {
        for (Integer id : ids) {
            logsMapper.deleteById(id);
        }
    }

    /**
     * 修改
     */
    public void updateById(Logs Logs) {
        logsMapper.updateById(Logs);
    }

    /**
     * 根据ID查询
     */
    public Logs selectById(Integer id) {
        return logsMapper.selectById(id);
    }

    /**
     * 查询所有
     */
    public List<Logs> selectAll(Logs Logs) {
        return logsMapper.selectAll(Logs);
    }

    /**
     * 分页查询
     */
    public PageInfo<Logs> selectPage(Logs Logs, Integer pageNum, Integer pageSize) {
        PageHelper.startPage(pageNum, pageSize);
        List<Logs> list = logsMapper.selectAll(Logs);
        return PageInfo.of(list);
    }


    
}