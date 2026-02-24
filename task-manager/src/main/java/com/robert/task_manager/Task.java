package com.robert.task_manager;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


@Entity
@Table(name = "task")

public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "Title can not be empty!")
    @Size(min = 3, message = "Title needs to have at least 3 characters!")
    private String title;

    private String description;

    private boolean completed = false;

    private String timeInterval;
    private String category;

    public Task() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public String getTimeInterval() { return timeInterval; }
    public void setTimeInterval(String timeInterval) { this.timeInterval = timeInterval; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Long getId() { return id; }

}
