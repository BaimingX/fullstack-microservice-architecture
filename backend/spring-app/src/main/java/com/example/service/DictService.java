package com.example.service;

import com.example.entity.Dict;
import com.example.mapper.DictMapper;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Service
public class DictService {

    @Resource
    DictMapper dictMapper;

    public List<Dict> selectByType(@RequestParam String type) {
        return dictMapper.selectByType(type);
    }

}
