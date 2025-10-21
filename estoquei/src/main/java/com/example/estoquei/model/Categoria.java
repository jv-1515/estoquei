package com.example.estoquei.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categorias")
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String nome;

    @Column(name = "tipo_tamanho", length = 1, nullable = false)
    private String tipoTamanho;

    @Column(name = "tipo_genero", length = 2, nullable = false)
    private String tipoGenero;

    // Getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getTipoTamanho() { return tipoTamanho; }
    public void setTipoTamanho(String tipoTamanho) { this.tipoTamanho = tipoTamanho; }

    public String getTipoGenero() { return tipoGenero; }
    public void setTipoGenero(String tipoGenero) { this.tipoGenero = tipoGenero; }
}