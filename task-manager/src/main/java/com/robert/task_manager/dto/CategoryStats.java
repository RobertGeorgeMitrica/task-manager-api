package com.robert.task_manager.dto;

public record CategoryStats (
        String category,
        Long taskCount,
        Double totalHours
) {}

