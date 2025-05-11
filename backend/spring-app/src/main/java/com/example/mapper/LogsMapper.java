package com.example.mapper;

import com.example.entity.Logs;

import java.util.List;

public interface LogsMapper {

    void insert(Logs logs);

    void deleteById(Integer id);

    void updateById(Logs logs);

    Logs selectById(Integer id);

    List<Logs> selectAll(Logs logs);

}
