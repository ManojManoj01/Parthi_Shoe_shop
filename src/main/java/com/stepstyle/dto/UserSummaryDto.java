package com.stepstyle.dto;

import com.stepstyle.entity.Role;

public class UserSummaryDto {

    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String shoeSize;
    private String preferredCategory;
    private String gender;
    private String bio;
    private String avatar;
    private boolean notifyPromotions = true;
    private boolean notifyOrderUpdates = true;

    public UserSummaryDto() {
    }

    public UserSummaryDto(Long id, String username, String email, String firstName, String lastName, Role role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }

    public static UserSummaryDto fromUser(com.stepstyle.entity.User user) {
        UserSummaryDto dto = new UserSummaryDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole()
        );
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setCity(user.getCity());
        dto.setState(user.getState());
        dto.setPostalCode(user.getPostalCode());
        dto.setShoeSize(user.getShoeSize());
        dto.setPreferredCategory(user.getPreferredCategory());
        dto.setGender(user.getGender());
        dto.setBio(user.getBio());
        dto.setAvatar(user.getAvatar());
        dto.setNotifyPromotions(user.isNotifyPromotions() != null && user.isNotifyPromotions());
        dto.setNotifyOrderUpdates(user.isNotifyOrderUpdates() != null && user.isNotifyOrderUpdates());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getShoeSize() {
        return shoeSize;
    }

    public void setShoeSize(String shoeSize) {
        this.shoeSize = shoeSize;
    }

    public String getPreferredCategory() {
        return preferredCategory;
    }

    public void setPreferredCategory(String preferredCategory) {
        this.preferredCategory = preferredCategory;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public boolean isNotifyPromotions() {
        return notifyPromotions;
    }

    public void setNotifyPromotions(boolean notifyPromotions) {
        this.notifyPromotions = notifyPromotions;
    }

    public boolean isNotifyOrderUpdates() {
        return notifyOrderUpdates;
    }

    public void setNotifyOrderUpdates(boolean notifyOrderUpdates) {
        this.notifyOrderUpdates = notifyOrderUpdates;
    }
}
