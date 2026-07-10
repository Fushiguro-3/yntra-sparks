package com.yntrasparks.backend.service;

import com.yntrasparks.backend.dto.request.ContactRequest;
import com.yntrasparks.backend.dto.response.ContactMessageResponse;
import com.yntrasparks.backend.entity.ContactMessage;
import com.yntrasparks.backend.exception.ResourceNotFoundException;
import com.yntrasparks.backend.repository.ContactMessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    public ContactService(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    public Page<ContactMessageResponse> getAll(Pageable pageable) {
        return contactMessageRepository.findAll(pageable)
                .map(ContactMessageResponse::from);
    }

    @Transactional
    public void delete(Long id) {
        ContactMessage message = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact message", id));
        contactMessageRepository.delete(message);
    }

    @Transactional
    public void submit(ContactRequest request) {
        ContactMessage message = new ContactMessage();
        message.setName(request.getName().trim());
        message.setEmail(request.getEmail().trim());
        message.setSubject(request.getSubject().trim());
        message.setMessage(request.getMessage().trim());
        contactMessageRepository.save(message);
    }
}
