package com.example.service;

import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.Authenticator;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.stereotype.Service;

import java.util.Properties;
import java.util.Random;

@Service
public class EmailService {

    private static final String SMTP_HOST = "smtp-mail.outlook.com";
    private static final String SMTP_PORT = "587";
    private static final String USERNAME = "support@auscoolstuff.com.au";
    private static final String PASSWORD = "gxpnkrmncwmnbzpn"; // 应用密码
    private static final String COMPANY_NAME = "AusCoolStuff";

    /**
     * 发送自定义内容邮件
     * @param to 收件人邮箱
     * @param subject 邮件主题
     * @param content 邮件内容
     * @return 是否发送成功
     */
    public boolean sendEmail(String to, String subject, String content) {
        // 配置邮件属性
        Properties props = new Properties();
        // 开启身份验证
        props.put("mail.smtp.auth", "true");
        // 开启 STARTTLS
        props.put("mail.smtp.starttls.enable", "true");
        // SMTP主机地址
        props.put("mail.smtp.host", SMTP_HOST);
        // SMTP端口
        props.put("mail.smtp.port", SMTP_PORT);
        // 设置连接超时
        props.put("mail.smtp.connectiontimeout", "10000");
        // 设置读取超时
        props.put("mail.smtp.timeout", "10000");

        // 根据配置和账号密码，创建会话
        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(USERNAME, PASSWORD);
            }
        });

        try {
            // 构建邮件内容
            MimeMessage message = new MimeMessage(session);
            // 设置发件人
            message.setFrom(new InternetAddress(USERNAME, COMPANY_NAME));
            // 设置收件人
            message.setRecipient(Message.RecipientType.TO, new InternetAddress(to));
            // 设置邮件主题
            message.setSubject(subject);
            
            // 设置邮件正文
            message.setContent(content, "text/html; charset=UTF-8");

            // 发送邮件
            Transport.send(message);
            System.out.println("Email sent successfully to " + to);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 发送验证码到指定邮箱
     * @param toEmail  收件人邮箱地址
     * @return         生成的验证码（以便后续比对）
     */
    public String sendVerificationCode(String toEmail) {
        // 1. 生成验证码（6位随机数示例）
        String verificationCode = String.format("%06d", new Random().nextInt(999999));

        // 2. 配置邮件属性
        Properties props = new Properties();
        // 开启身份验证
        props.put("mail.smtp.auth", "true");
        // 开启 STARTTLS
        props.put("mail.smtp.starttls.enable", "true");
        // SMTP主机地址
        props.put("mail.smtp.host", SMTP_HOST);
        // SMTP端口
        props.put("mail.smtp.port", SMTP_PORT);
        // 设置连接超时
        props.put("mail.smtp.connectiontimeout", "10000");
        // 设置读取超时
        props.put("mail.smtp.timeout", "10000");

        // 3. 根据配置和账号密码，创建会话
        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                // 这里填入发件人邮箱用户名/密码
                return new PasswordAuthentication(USERNAME, PASSWORD);
            }
        });

        try {
            // 4. 构建邮件内容
            MimeMessage message = new MimeMessage(session);
            // 设置发件人
            message.setFrom(new InternetAddress(USERNAME, COMPANY_NAME));
            // 设置收件人
            message.setRecipient(Message.RecipientType.TO, new InternetAddress(toEmail));
            // 设置邮件主题
            message.setSubject("Your Verification Code - " + COMPANY_NAME);
            
            // 设置邮件正文 - HTML格式更专业
            String htmlContent = 
                "<html><body style='font-family: Arial, sans-serif;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>" +
                "<h2 style='color: #4a86e8;'>Dear User,</h2>" +
                "<p>Thank you for using our service. Here is your verification code:</p>" +
                "<div style='background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;'>" +
                verificationCode +
                "</div>" +
                "<p>This verification code is valid for 10 minutes. Please do not share this code with anyone.</p>" +
                "<p>If you did not request this verification code, please ignore this email.</p>" +
                "<p>We hope you enjoy our service!</p>" +
                "<hr style='border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;'>" +
                "<p style='color: #757575; font-size: 12px;'>This is an automated email. Please do not reply directly.</p>" +
                "</div></body></html>";
            
            message.setContent(htmlContent, "text/html; charset=UTF-8");

            // 5. 发送邮件
            Transport.send(message);
            System.out.println("Verification code email sent to " + toEmail);
        } catch (MessagingException e) {
            e.printStackTrace();
            // 这里可根据业务需求，做异常处理，比如抛自定义异常，或返回null等
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        // 6. 返回验证码，以便后续校验
        //   - 你可以在此处将 (邮箱, 验证码, 生成时间) 存储到数据库或缓存
        //   - 后面当用户提交验证码时再进行对比
        return verificationCode;
    }
}
