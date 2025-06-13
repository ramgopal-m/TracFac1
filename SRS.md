# TracFac - Student-Faculty Tracking and Communication System

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document outlines the requirements for the TracFac system, a comprehensive platform designed to facilitate direct communication between faculty and students without relying on external communication channels. The system aims to streamline academic interactions, program management, and student-faculty relationships within educational institutions.

### 1.2 Document Conventions
This document follows standard SRS conventions with the following formatting:
- **Bold text** indicates important terms or concepts
- *Italic text* is used for emphasis
- Requirements are numbered hierarchically (e.g., 4.1.2)

### 1.3 Intended Audience
This document is intended for:
- Software developers implementing the TracFac system
- Project managers overseeing the development process
- Stakeholders including faculty members, students, and administrators
- Quality assurance teams responsible for testing
- Documentation teams creating user guides

### 1.4 Additional Information
The TracFac system is designed to be a comprehensive solution for academic institutions, providing a centralized platform for student-faculty interaction and program management.

### 1.5 Contact Information/SRS Team Members
The SRS document was prepared by the following team members:
- Geetesh K (AP22110010062) - Project Manager and Technical Writer
- Nagur Meeravali Shaik (AP22110010062) - Lead Developer
- Mansoor Muzahid Shaik (AP22110010019) - Frontend Developer and QA Engineer
- Ram Gopal M (AP22110010063) - Frontend Developer and UI/UX Designer

### 1.6 References
The following documents were referenced in the creation of this SRS:
- Architecture Diagrams
- ER Diagram
- Class Diagram
- Use Case Diagram
- Sequence Diagram
- Package Diagram
- Object Diagram
- Data Flow Diagram

## 2. Overall Description

### 2.1 Product Perspective
TracFac is a web-based application that integrates with existing educational institution systems. It serves as a bridge between faculty and students, eliminating the need for external communication channels such as email, messaging apps, or social media platforms. The system is designed to be intuitive, accessible, and secure, providing a seamless experience for all users.

### 2.2 Product Functions
TracFac provides the following core functions:
- User authentication and role-based access control
- Profile management for students and faculty
- Program and section management
- Student enrollment in programs and sections
- Direct messaging between students and faculty
- File sharing and document management
- Notification system for important updates
- Comprehensive admin dashboard for system management

### 2.3 User Classes and Characteristics
The system has three primary user classes:
- **Students:** Undergraduate and graduate students enrolled in programs. They can view and edit their profiles, enroll in programs, communicate with faculty, and access academic resources.
- **Faculty:** Teaching staff who interact with students and programs. They can view student profiles, communicate with students, and access program information assigned to them by administrators.
- **Administrators:** System administrators with full access to all features and user management capabilities. Admins can manage all programs and students across the system, regardless of faculty assignments. They have comprehensive oversight of the entire platform, including password recovery processes and real-time program management.

### 2.4 Operating Environment
The TracFac system operates in the following environment:
- Web-based application accessible through modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for desktop, tablet, and mobile devices
- Cloud-hosted with secure data storage

### 2.5 Design and Implementation Constraints
The following constraints apply to the system design and implementation:
- Must be scalable to accommodate growing user bases
- Must support real-time updates for program changes and notifications
- Must maintain data integrity across all user roles (admin, faculty, student)
- Must support secure file uploads and downloads

### 2.6 Assumptions and Dependencies
The following assumptions and dependencies apply:
- Users have basic computer literacy and internet access
- The system depends on reliable internet connectivity

### 2.7 Academic Initiative Types
TracFac supports various types of academic initiatives, including:
- **Regular Courses:** Standard academic courses with lectures, assignments, and assessments.
- **Mentor-Mentee Programs:** One-on-one or small group mentoring relationships where faculty guide students in academic or career development.
- **Research Projects:** Collaborative research initiatives between faculty and students.
- **Student Clubs:** Student organizations with faculty advisors for extracurricular activities.
- **Workshops and Seminars:** Short-term educational events with specific learning objectives.
- **Internship Programs:** Structured work experiences with academic oversight.

Each initiative type can be configured with specific attributes and requirements based on its nature and objectives.

## 3. External Interface Requirements

### 3.1 User Interfaces
The system shall provide the following user interfaces:
- Login and registration screens
- Dashboard interfaces for students, faculty, and administrators
- Profile management screens
- Program and section management interfaces
- Messaging and communication interfaces
- File upload and management screens

### 3.2 Hardware Interfaces
The system shall be compatible with the following hardware:
- Desktop computers and laptops
- Tablets and mobile devices
- Standard input devices (keyboard, mouse, touchscreen)
- Standard output devices (monitor, speakers)

### 3.3 Software Interfaces
The system shall interface with the following software:
- Web browsers (Chrome, Firefox, Safari, Edge)
- Email systems for notifications

### 3.4 Communication Protocols
The system shall use the following communication protocols:
- HTTPS for secure data transmission
- RESTful API for service integration

## 4. System Features

### 4.1 User Authentication
**Description:** The system shall provide secure authentication for all users.
**Priority:** High
**Functional Requirements:**
- 4.1.1 The system shall allow administrators to create user accounts with email, password, and role selection.
- 4.1.2 The system shall authenticate users based on credentials.
- 4.1.3 The system shall implement password recovery mechanisms under admin surveillance.
- 4.1.4 The system shall allow administrators to reset user passwords when necessary.

### 4.2 Profile Management
**Description:** The system shall allow users to create and manage their profiles.
**Priority:** High
**Functional Requirements:**
- 4.2.1 The system shall allow students to input academic information (college, branch, department, year, semester, GPA).
- 4.2.2 The system shall allow faculty to input professional information (department, specialization, office hours).
- 4.2.3 The system shall support profile picture uploads.
- 4.2.4 The system shall allow users to update their profile information.

### 4.3 Program Management
**Description:** The system shall allow administrators to create and manage programs and sections, with real-time redirection to students and faculty.
**Priority:** High
**Functional Requirements:**
- 4.3.1 The system shall allow administrators to create new programs with title and description.
- 4.3.2 The system shall allow administrators to create sections within programs.
- 4.3.3 The system shall allow administrators to manage student enrollment in programs and sections.
- 4.3.4 The system shall allow administrators to view comprehensive details about all programs.
- 4.3.5 The system shall allow administrators to view detailed information about all students.
- 4.3.6 The system shall support different types of academic initiatives (courses, mentor-mentee programs, clubs, etc.).
- 4.3.7 The system shall provide real-time updates to students and faculty when program changes occur.
- 4.3.8 The system shall allow administrators to assign faculty to programs and sections.

### 4.4 Student Enrollment
**Description:** The system shall allow administrators to add students and manage their enrollment in programs and sections.
**Priority:** High
**Functional Requirements:**
- 4.4.1 The system shall allow administrators to add new students to the system.
- 4.4.2 The system shall automatically generate login credentials for new students.
- 4.4.3 The system shall allow students to view available programs and sections after logging in.
- 4.4.4 The system shall allow administrators to enroll students in programs and sections.
- 4.4.5 The system shall notify students of their program and section assignments.
- 4.4.6 The system shall allow students to communicate with faculty assigned to their programs.

### 4.5 Messaging
**Description:** The system shall provide direct messaging between students and faculty.
**Priority:** High
**Functional Requirements:**
- 4.5.1 The system shall allow users to send direct messages to other users.
- 4.5.2 The system shall support group conversations for programs and sections.
- 4.5.3 The system shall provide message notifications.

### 4.6 File Management
**Description:** The system shall allow users to upload, store, and share files.
**Priority:** Medium
**Functional Requirements:**
- 4.6.1 The system shall allow users to upload files to their profiles.
- 4.6.2 The system shall support common file formats (PDF, DOC, XLS, images).

### 4.7 Notification System
**Description:** The system shall notify users of important updates and communications.
**Priority:** Medium
**Functional Requirements:**
- 4.7.1 The system shall notify users of new messages.
- 4.7.2 The system shall notify students of program and section updates.

### 4.8 Admin Dashboard
**Description:** The system shall provide administrators with comprehensive management capabilities.
**Priority:** High
**Functional Requirements:**
- 4.8.1 The system shall allow administrators to create and manage user accounts.
- 4.8.2 The system shall allow administrators to configure system settings.
- 4.8.3 The system shall provide tools for managing notifications and communications.
- 4.8.4 The system shall allow administrators to manage all programs across the system.
- 4.8.5 The system shall allow administrators to view and manage all student information.
- 4.8.6 The system shall allow administrators to assign and reassign faculty to programs.
- 4.8.7 The system shall allow administrators to monitor and manage password recovery processes.
- 4.8.8 The system shall provide administrators with real-time monitoring of system activities.
- 4.8.9 The system shall allow administrators to create new user accounts with appropriate roles and permissions.

## 5. Other Nonfunctional Requirements

### 5.1 Performance Requirements
The system shall meet the following performance requirements:
- Page load time shall not exceed 3 seconds under normal conditions
- The system shall maintain responsiveness during peak usage periods
- The system shall support at least 1000 concurrent users

### 5.2 Safety Requirements
The system shall implement the following safety measures:
- Input validation to prevent injection attacks
- File type validation to prevent malicious uploads

### 5.3 Security Requirements
The system shall implement the following security measures:
- Role-based access control for all features
- Secure password storage using hashing algorithms

### 5.4 Software Quality Attributes
The system shall exhibit the following quality attributes:
- Usability: Intuitive interface requiring minimal training
- Maintainability: Modular design with clear documentation
- Portability: Compatibility with major browsers and devices

### 5.5 Project Documentation
The following documentation shall be provided:
- Software Requirements Specification (this document)
- User Manual

### 5.6 User Documentation
The following user documentation shall be provided:
- Student User Guide
- Faculty User Guide
- Administrator User Guide

## 6. Other Requirements

### 6.1 Additional Requirements
The system shall include the following additional features:
- Responsive design for mobile and tablet devices
- Search functionality across all content
- Customizable dashboard layouts

## Terminology
- **TracFac:** The Student-Faculty Tracking and Communication System
- **Program:** A structured academic offering with specific objectives and outcomes
- **Section:** A subdivision of a program, typically representing a class or group
- **Enrollment:** The process of a student joining a program or section
- **Profile:** User information including personal and academic/professional details
- **Academic Initiative:** Any structured academic program, course, mentor-mentee relationship, or student organization managed through the system
- **Mentor-Mentee Program:** A specialized academic initiative where faculty mentors guide students in academic or career development through one-on-one or small group interactions
- **Dashboard:** A centralized interface displaying relevant information and controls for a specific user role

## Appendix A: Future Considerations
The following features may be considered for future releases:
- Mobile application for iOS and Android
- Advanced analytics and reporting
- Enhanced file collaboration features
- Virtual meeting integration 