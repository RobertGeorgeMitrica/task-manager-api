package com.robert.task_manager;

import jakarta.persistence.*;


@Entity
@Table(name = "task")

public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    private boolean completed = false;

    // CONSTRUCTOR GOL (Obligatoriu pentru Spring/Hibernate)
    public Task() {}

    // GETTERI ȘI SETTERI (Spring are nevoie de ei să citească din JSON)
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public Long getId() { return id; }
}
