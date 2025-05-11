package com.example.entity;



import lombok.Data;


@Data
public class GoodsMedia {


    private Integer id;  // ID (自增主键)

    private Integer goodsId;  // 关联的商品ID

    private MediaType mediaType;  // 媒体类型（图片或视频）

    private String url;  // 媒体 URL

    private String thumbnailUrl;  // 视频封面缩略图（如果是视频）


    private Goods goods;  // 关联的商品对象（可选）

    public enum MediaType {
        image, video
    }
}
