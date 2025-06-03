package com.example.estoquei.model;

public enum TipoUsuario {
    FUNCIONARIO(0), GERENTE(1), ADMIN(2);

    private final int value;

    TipoUsuario(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
