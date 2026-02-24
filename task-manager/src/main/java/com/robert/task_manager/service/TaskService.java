package com.robert.task_manager.service;

import com.robert.task_manager.Task;
import com.robert.task_manager.TaskRepository;
import com.robert.task_manager.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    public List<Task> getAllTask(){
        return taskRepository.findAll();
    }

    public Task saveTask(Task task) {
        return taskRepository.save(task);
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task ID " + id + " was not found!"));
    }

    public Task updateTask(Long id, Task taskDetails) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Update not possible! Task ID " + id + " not found."));

        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setCompleted(taskDetails.isCompleted());
        task.setTimeInterval(taskDetails.getTimeInterval());
        task.setCategory(taskDetails.getCategory());
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Nu pot șterge! Task-ul cu ID " + id + " nu a fost găsit.");
        }
        taskRepository.deleteById(id);
    }

}
