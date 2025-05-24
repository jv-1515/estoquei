package com.example.estoquei.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public class Router {

    @GetMapping
    public String index() {
        return "index";
    }

    @GetMapping("/cadastro")
    public String cadastro() {
        return "cadastro_produto";
    }
}