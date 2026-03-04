package com.robert.task_manager.service;

import com.robert.task_manager.Task;
import com.robert.task_manager.TaskRepository;
import com.robert.task_manager.exception.ResourceNotFoundException;
import dto.TaskDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    public List<Task> getAllTask(){
        return taskRepository.findAll();
    }

    public TaskDTO saveTaskDTO(TaskDTO taskDTO) {
        // 1. Convertim DTO-ul primit de la client în Entitate pentru baza de date
        Task task = convertToEntity(taskDTO);
        Task savedTask = taskRepository.save(task);
        return convertToDTO(savedTask);
    }

    public TaskDTO getTaskByIdDTO(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task ID " + id + " was not found!"));
        return convertToDTO(task);
    }

    public TaskDTO updateTask(Long id, TaskDTO taskDetailsDTO) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Update not possible! Task ID " + id + " not found."));

        task.setTitle(taskDetailsDTO.getTitle());
        task.setDescription(taskDetailsDTO.getDescription());
        task.setCompleted(taskDetailsDTO.isCompleted());
        task.setTimeInterval(taskDetailsDTO.getTimeInterval());
        task.setCategory(taskDetailsDTO.getCategory());
        task.setPriority(taskDetailsDTO.getPriority());
        task.setDueDate(taskDetailsDTO.getDueDate());

        Task updatedTask = taskRepository.save(task);
        return convertToDTO(updatedTask);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Nu pot șterge! Task-ul cu ID " + id + " nu a fost găsit.");
        }
        taskRepository.deleteById(id);
    }

    private TaskDTO convertToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setCompleted(task.isCompleted());
        dto.setTimeInterval(task.getTimeInterval());
        dto.setCategory(task.getCategory());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate());
        return dto;
    }

    private Task convertToEntity(TaskDTO dto) {
        Task task = new Task();

        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setCompleted(dto.isCompleted());
        task.setTimeInterval(dto.getTimeInterval());
        task.setCategory(dto.getCategory());
        task.setPriority(dto.getPriority());
        task.setDueDate(dto.getDueDate());
        return task;
    }

    public List<TaskDTO> getAllTasksDTO() {
        return taskRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByPriority(String priority) {
        return taskRepository.findByPriority(priority)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTaskByDueDate(LocalDate date) {
        return taskRepository.findByDueDate(date)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

}
