package com.ecommerce.user_service.service;

import com.ecommerce.user_service.entity.User;
import com.ecommerce.user_service.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    // CREATE
    public User createUser(User user) {

        if (repository.existsByEmail(user.getEmail())) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }

        return repository.save(user);
    }

    // GET ALL
    public List<User> getAllUsers() {

        return repository.findAll();
    }

    // GET BY ID
    public Optional<User> getUserById(Long id) {

        return repository.findById(id);
    }

    // GET BY EMAIL
    public Optional<User> getUserByEmail(String email) {

        return repository.findByEmail(email);
    }

    // UPDATE
    public User updateUser(
            Long id,
            User updatedUser
    ) {

        User existingUser =
                repository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        existingUser.setName(
                updatedUser.getName()
        );

        existingUser.setEmail(
                updatedUser.getEmail()
        );

        existingUser.setPassword(
                updatedUser.getPassword()
        );

        existingUser.setPhone(
                updatedUser.getPhone()
        );

        return repository.save(existingUser);
    }

    // DELETE
    public void deleteUser(Long id) {

        if (!repository.existsById(id)) {

            throw new RuntimeException(
                    "User not found"
            );
        }

        repository.deleteById(id);
    }
}
