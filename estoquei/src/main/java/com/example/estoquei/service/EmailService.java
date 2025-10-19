package com.example.estoquei.service;

import org.springframework.stereotype.Service;

import com.example.estoquei.dto.MailBody;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;


@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void sendSimpleMessage(MailBody mailBody) {
        SimpleMailMessage message = new SimpleMailMessage();
        
        message.setTo(mailBody.to());
        message.setFrom(fromEmail);
        message.setSubject(mailBody.subject());
        message.setText(mailBody.text());
        
        javaMailSender.send(message);
    }
}
