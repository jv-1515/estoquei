package com.example.estoquei.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.example.estoquei.dto.MailBody;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;


@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void sendHtmlMessage(MailBody mailBody, String htmlContent) throws MessagingException {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8"); 

        helper.setFrom(fromEmail);
        helper.setTo(mailBody.to());
        helper.setSubject(mailBody.subject());
        helper.setText(htmlContent, true);

        javaMailSender.send(mimeMessage);
    }

    public void sendHtmlMessageWithInlineImage(MailBody mailBody, String htmlContent, String imageCid, String imagePath) throws MessagingException {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(mailBody.to());
        helper.setSubject(mailBody.subject());
        helper.setText(htmlContent, true);

        ClassPathResource image = new ClassPathResource(imagePath);
        helper.addInline(imageCid, image);

        javaMailSender.send(mimeMessage);
    }
}
