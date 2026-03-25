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
        Task task = new Task();
        copyDtoToEntity(taskDTO, task);
        Task savedTask = taskRepository.save(task);
        return convertToDTO(savedTask);
    }

    public TaskDTO getTaskByIdDTO(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task ID " + id + " was not found!"));
        return convertToDTO(task);
    }

    public TaskDTO updateTask(Long id, TaskDTO taskDetailsDTO) {
        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found!"));

        copyDtoToEntity(taskDetailsDTO, existingTask);

        Task updatedTask = taskRepository.save(existingTask);
        return convertToDTO(updatedTask);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("No taask to be deleted! Task with ID " + id + " was not found.");
        }
        taskRepository.deleteById(id);
    }

    public void deleteCompletedTasks() {
        List<Task> completed = taskRepository.findByCompleted(true);
        taskRepository.deleteAll(completed);
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

    private void copyDtoToEntity(TaskDTO dto, Task entity) {
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setCompleted(dto.isCompleted());
        entity.setTimeInterval(dto.getTimeInterval());
        entity.setCategory(dto.getCategory());
        entity.setPriority(dto.getPriority());
        entity.setDueDate(dto.getDueDate());
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
