package com.homespot.repository;

import com.homespot.model.Booking;
import com.homespot.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, String> {
    List<Message> findByBookingOrderByCreatedAtAsc(Booking booking);
    List<Message> findByBookingIdOrderByCreatedAtAsc(String bookingId);
}
