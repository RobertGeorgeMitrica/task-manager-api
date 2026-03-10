package com.robert.task_manager;

import com.robert.task_manager.dto.CategoryStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByPriority(String priority);
    List<Task> findByDueDate(LocalDate date);
    List<Task> findByCompleted(boolean completed);

    @Query("SELECT new com.robert.task_manager.dto.CategoryStats(t.category, COUNT(t), SUM(1.5)) " +
            "FROM Task t WHERE t.completed = true " +
            "GROUP BY t.category")
    List<CategoryStats> getProductivityReport();
}
