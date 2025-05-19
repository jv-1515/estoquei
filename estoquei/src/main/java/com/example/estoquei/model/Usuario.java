package com.example.estoquei.model;

public class Usuario {
    private String id;
    private String nome;
    private TipoUsuario tipo;

    public Usuario(){

    }

    public Usuario(String nome, TipoUsuario tipo){
        this.nome=nome;
        this.tipo=tipo;
    }

    public String getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public TipoUsuario getTipo() {
        return tipo;
    }

    public void setTipo(TipoUsuario tipo) {
        this.tipo = tipo;
    }
}
