package com.homespot.repository;

import com.homespot.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    @Query(value = "{ 'booking': ?0 }", sort = "{ 'createdAt': 1 }")
    List<Message> findByBookingIdOrderByCreatedAtAsc(String bookingId);
}
