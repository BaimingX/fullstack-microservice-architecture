package com.example.mapper;

import com.example.entity.GoodsMedia;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface GoodsMediaMapper {

    /**
     * 根据商品ID查询所有媒体信息
     */
    @Select("""
        SELECT * 
        FROM goods_media
        WHERE goods_id = #{goodsId}
        
    """)
    List<GoodsMedia> findByGoodsId(@Param("goodsId") Integer goodsId);

    /**
     * 插入一条媒体记录
     */
    @Insert("""
        INSERT INTO goods_media
        (goods_id, media_type, url)
        VALUES
        (#{goodsId}, #{mediaType}, #{url})
    """)
    void insert(GoodsMedia goodsMedia);

    /**
     * 根据ID删除
     */
    @Delete("DELETE FROM goods_media WHERE id = #{id}")
    void deleteById(@Param("id") Integer id);

    // ... 其他更新、批量删除等方法可自行扩展
}
