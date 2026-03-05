package com.robert.task_manager;

import com.robert.task_manager.dto.CategoryStats;
import com.robert.task_manager.service.TaskService;
import dto.TaskDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;


@RestController
@RequestMapping("/api/tasks")
@CrossOrigin
public class TaskController {
    @Autowired
    private TaskService taskService;

    @Autowired
    private TaskRepository taskRepository;

    @GetMapping
    public List<TaskDTO> getAllTask() {
        return taskService.getAllTasksDTO();
    }

    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@Valid @RequestBody TaskDTO taskDTO) {
        TaskDTO savedTaskDTO = taskService.saveTaskDTO(taskDTO);
        return new ResponseEntity<>(savedTaskDTO, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        TaskDTO taskDTO = taskService.getTaskByIdDTO(id);
        return new ResponseEntity<>(taskDTO, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(@Valid @PathVariable Long id, @RequestBody TaskDTO taskdetailsDTO){
        TaskDTO updateTask = taskService.updateTask(id, taskdetailsDTO);
        return new ResponseEntity<>(updateTask, HttpStatus.OK);
    }

    @GetMapping("/filter")
    public List<TaskDTO> getTasksByPriority(@RequestParam String priority) {
        return taskService.getTasksByPriority(priority);
    }

    @GetMapping("/date")
    public List<TaskDTO> getTaskByDueDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return  taskService.getTaskByDueDate(date);
    }

    @GetMapping("/report")
    public List<CategoryStats> getReport() {
        return taskRepository.getProductivityReport();
    }
}

