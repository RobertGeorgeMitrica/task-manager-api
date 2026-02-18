package com.robert.task_manager;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface TaskRepository extends JpaRepository<Task, Long> {
    // Aici Spring Boot ne oferă automat metodele:
    // save(), findById(), findAll(), deleteById()
}
