package com.example.controller;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.lang.Dict;
import cn.hutool.core.lang.UUID;
import cn.hutool.core.util.StrUtil;
import com.example.common.Constants;
import com.example.common.Result;
import com.example.entity.GoodsMedia;
import com.example.mapper.GoodsMediaMapper;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.HandlerMapping;

import java.io.*;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * 文件接口
 */
@RestController
@RequestMapping("/files")
public class FileController {

    @Resource
    private GoodsMediaMapper goodsMediaMapper;

    private static final Logger log = LoggerFactory.getLogger(FileController.class);


    // 使用相对于应用的路径
    private static final String filePath = "files/download/";

    @Value("${fileBaseUrl:}")
    private String fileBaseUrl;

    /**
     * 文件上传
     */
    @PostMapping("/upload")
    public Result upload(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        try {
            if (!FileUtil.isDirectory(filePath)) {
                FileUtil.mkdir(filePath);
            }
            fileName = System.currentTimeMillis() + "-" + fileName;
            String realFilePath = filePath + fileName;
            // 文件存储形式：时间戳-文件名
            FileUtil.writeBytes(file.getBytes(), realFilePath);
        } catch (Exception e) {
            log.error(fileName + "--文件上传失败", e);
        }
        String url = fileBaseUrl + "/files/download/" + fileName;
        return Result.success(url);
    }


    /**
     * 文件+媒体信息上传接口
     * @param goodsId   商品ID
     * @param mediaType 媒体类型 (image / video)
     * @param file      上传的文件
     */
    @PostMapping("/uploadMedia/{goodsId}")
    public Result uploadMedia(
            @PathVariable("goodsId") Integer goodsId,
            @RequestParam("mediaType") String mediaType,
            @RequestParam("file") MultipartFile file
    ) {
        // 1. 校验媒体类型
        if (!"image".equals(mediaType) && !"video".equals(mediaType)) {
            return Result.error("不支持的媒体类型: " + mediaType);
        }

        // 2. 检查或创建目录 /files/download/{goodsId}/
        String uploadPath = filePath + goodsId + "/";
        File dir = new File(uploadPath);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // 3. 生成新文件名
        String originalName = file.getOriginalFilename();
        if (originalName == null) {
            originalName = "unknown";
        }
        String newFileName = System.currentTimeMillis() + "-" + originalName;
        String realFilePath = uploadPath + newFileName;

        try {
            // 4. 把文件写入本地 /files/download/{goodsId}/{newFileName}
            FileUtil.writeBytes(file.getBytes(), realFilePath);

            // 5. 处理视频文件
            String fileUrl;
            if ("video".equals(mediaType)) {
                // 调用 FFmpeg 进行 HLS 转码
                String m3u8FilePath = convertToHLS(realFilePath);

                // 删除原始 .mp4 文件
                Files.deleteIfExists(Paths.get(realFilePath));

                // 设置返回的 HLS URL
                fileUrl = fileBaseUrl +"/" +m3u8FilePath;
            } else {
                // 图片文件直接返回存储路径
                fileUrl = fileBaseUrl + "/files/download/" + goodsId + "/" + newFileName;
            }

            // 6. 把这条记录插入 goods_media 表 (此处只是示例)
            // 示例: 伪代码
            GoodsMedia gm = new GoodsMedia();
            gm.setGoodsId(goodsId);
            gm.setMediaType(GoodsMedia.MediaType.valueOf(mediaType));
            gm.setUrl(fileUrl);
            goodsMediaMapper.insert(gm);

            // 7. 构造返回值
            Map<String, Object> data = new HashMap<>();
            data.put("url", fileUrl);
            data.put("mediaType", mediaType);
            return Result.success(data);
        } catch (IOException e) {
            return Result.error("文件处理失败: " + e.getMessage());
        }
    }


    /**
     * 下载接口: /files/download/{goodsId}/{fileName}
     */
    @GetMapping("/download/{goodsId:\\d+}/{fileName}")
    public void downloadWithGoodsId(
            @PathVariable Integer goodsId,
            @PathVariable String fileName,
            HttpServletResponse response
    ) {
        // 1. 构造真实路径
        String realFilePath = filePath + goodsId + "/" + fileName;
        File file = new File(realFilePath);
        if (!file.exists()) {
            // 文件不存在，直接返回 404
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }
        // 2. 设置响应头
        try {
            response.addHeader("Content-Disposition",
                    "attachment;filename=" + URLEncoder.encode(fileName, StandardCharsets.UTF_8));
            response.setContentType("application/octet-stream");

            // 3. 输出文件字节流
            try (OutputStream os = response.getOutputStream()) {
                byte[] bytes = Files.readAllBytes(file.toPath());
                os.write(bytes);
                os.flush();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @GetMapping("/download/{goodsId}/**")
    public void downloadHls(
            @PathVariable Integer goodsId,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        // 1) 获取匹配到的URL pattern和实际访问的path
        // Spring 5.3 之后可以这样取，也可以用 request.getRequestURI() 截取
        String pattern = (String) request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        String path = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);

        // pattern 可能是  /files/download/{goodsId}/**
        // path    可能是  /files/download/28/1742312390475-c029181b9d45a23cde9dc8a216bc64e4c09f214b.f30_hls/index.m3u8
        // 我们要从 path 中把 "/files/download/{goodsId}/" 部分去掉，拿到子路径

        // 先将 {goodsId}/** 从 pattern 中去掉
        // 之后得到的 pattern 就是 "/files/download"
        // 再把它从 path 中替换掉，就能得到 "28/xxx_hls/index.m3u8" 这样的子路径
        String subPath = path.replaceFirst(pattern.replace("/{goodsId}/**", ""), "");
        // subPath =>  "28/1742312..._hls/index.m3u8"

        // 如果只想保留 "1742312..._hls/index.m3u8" 那段，需要去掉开头的 "28/"
        String prefix = goodsId + "/";
        if (subPath.startsWith(prefix)) {
            subPath = subPath.substring(prefix.length());
        }
        // subPath => "1742312390475-c0..._hls/index.m3u8" 这一段

        // 2) 拼出本地真实文件路径:  filePath + goodsId + "/" + subPath
        String realFilePath = filePath  + subPath;
        File file = new File(realFilePath);
        if (!file.exists()) {
            // 文件不存在，返回 404
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        // 3) 根据文件后缀来设置合适的 Content-Type
        //    - .m3u8 => application/vnd.apple.mpegurl 或 application/x-mpegURL
        //    - .ts   => video/mp2t
        //    - 其它  => 通用 application/octet-stream
        if (realFilePath.endsWith(".m3u8")) {
            response.setContentType("application/vnd.apple.mpegurl");
        } else if (realFilePath.endsWith(".ts")) {
            response.setContentType("video/mp2t");
        } else {
            response.setContentType("application/octet-stream");
        }

        // 如果需要断点续传，还要额外处理 Content-Range/206 等逻辑，这里简化不演示

        // 4) 写文件到响应流
        try (OutputStream os = response.getOutputStream()) {
            byte[] bytes = Files.readAllBytes(file.toPath());
            os.write(bytes);
            os.flush();
        } catch (IOException e) {
            // 可根据需要记录日志
        }
    }


    /**
     * 获取文件
     */
    @GetMapping("/download/{fileName:.+}")
    public void download(@PathVariable String fileName, HttpServletResponse response) {
        OutputStream os;
        try {
            if (StrUtil.isNotEmpty(fileName)) {
                response.addHeader("Content-Disposition", "attachment;filename=" + URLEncoder.encode(fileName, StandardCharsets.UTF_8));
                response.setContentType("application/octet-stream");
                byte[] bytes = FileUtil.readBytes(filePath + fileName);
                os = response.getOutputStream();
                os.write(bytes);
                os.flush();
                os.close();
            }
        } catch (Exception e) {
            log.error("文件下载失败：" + fileName, e);
        }
    }

    /**
     * wang-editor编辑器文件上传接口
     */
    @PostMapping("/wang/upload")
    public Map<String, Object> wangEditorUpload(MultipartFile file) {
        String flag = System.currentTimeMillis() + "";
        String fileName = file.getOriginalFilename();
        try {
            // 文件存储形式：时间戳-文件名
            FileUtil.writeBytes(file.getBytes(), filePath + flag + "-" + fileName);
            Thread.sleep(1L);
        } catch (Exception e) {
            log.error("wangeditor文件上传错误", e);
        }
        String http = fileBaseUrl + "/files/download/";
        Map<String, Object> resMap = new HashMap<>();
        // wangEditor上传图片成功后， 需要返回的参数
        resMap.put("errno", 0);
        resMap.put("data", CollUtil.newArrayList(Dict.create().set("url", http + flag + "-" + fileName)));
        return resMap;
    }

    private final String uploadDir = System.getProperty("user.dir") +"/files/var/www/"; // 你可以修改上传目录

    @PostMapping("/videoUpload")
    public String uploadVideo(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return "上传失败，文件为空！";
        }

        try {
            // 生成唯一文件名
            String fileName = UUID.randomUUID() + ".mp4";
            Path videoPath = Paths.get(uploadDir + fileName);
            Files.createDirectories(videoPath.getParent());
            Files.write(videoPath, file.getBytes());

            // 处理 HLS 转换
            String m3u8FilePath = convertToHLS(videoPath.toString());

            return "上传成功，访问地址：" + m3u8FilePath;
        } catch (IOException e) {
            return "上传失败：" + e.getMessage();
        }
    }

    private String convertToHLS(String inputFilePath) {
        // 使用Linux上安装的ffmpeg路径，通常在/usr/bin/ffmpeg
        String ffmpegPath = "/usr/bin/ffmpeg";
        String outputDir = inputFilePath.replace(".mp4", "_hls");
        File outputFolder = new File(outputDir);
        if (!outputFolder.exists()) outputFolder.mkdirs();

        String m3u8Path = outputDir + "/index.m3u8";

        try {
            // Use ProcessBuilder instead of Runtime.exec for better handling of arguments
            ProcessBuilder pb = new ProcessBuilder(
                    ffmpegPath,
                    "-i", inputFilePath,
                    "-ss", "0",                 // 从第0秒开始截取
                    "-t", "30",                 // 只输出前30秒
                    "-c:v", "libx264",
                    "-crf", "30",               // 比28更高的数值，代表更高的压缩率
                    "-preset", "medium",
                    "-tune", "film",
                    "-profile:v", "main",
                    "-level", "4.0",
                    "-vf", "scale=-2:720",
                    "-r", "24",
                    "-g", "48",
                    "-c:a", "aac",
                    "-b:a", "96k",
                    "-ar", "44100",
                    "-ac", "2",
                    "-start_number", "0",
                    "-hls_time", "10",
                    "-hls_list_size", "0",
                    "-hls_segment_type", "mpegts",
                    "-hls_flags", "independent_segments",
                    "-f", "hls",
                    m3u8Path
            );


            // Redirect error stream to output stream
            pb.redirectErrorStream(true);

            // Start the process
            Process process = pb.start();

            // Capture the output
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                    System.out.println("FFmpeg: " + line);  // Log FFmpeg output
                }
            }

            // Wait for the process to complete with a timeout
            boolean completed = process.waitFor(5, TimeUnit.MINUTES);

            if (!completed) {
                process.destroyForcibly();
                return "HLS 转码失败：超时，处理时间超过5分钟";
            }

            // Check if the process completed successfully
            int exitCode = process.exitValue();
            if (exitCode != 0) {
                return "HLS 转码失败：FFmpeg 退出代码 " + exitCode + "\n" + output.toString();
            }

            // Check if the m3u8 file was created
            File m3u8File = new File(m3u8Path);
            if (!m3u8File.exists()) {
                return "HLS 转码失败：未生成 m3u8 文件\n" + output.toString();
            }

            String userDir = System.getProperty("user.dir");
            
            // 将 outputDir 替换成相对于 userDir 的路径
            String relativePath = outputDir.replace(userDir, "");
            
            // 确保路径使用正斜杠(Linux标准)
            relativePath = relativePath.replace("\\", "/");
            
            String relativeM3u8 = relativePath + "/index.m3u8";

            return relativeM3u8;
        } catch (Exception e) {
            e.printStackTrace();
            return "HLS 转码失败：" + e.getMessage();
        }
    }

}
