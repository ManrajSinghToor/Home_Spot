package com.homespot.dto;

public class MessageRequest {
    private String bookingId;
    private String text;

    public MessageRequest() {}

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
