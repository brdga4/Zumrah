# Stage 2 Project Charter: Zumrah

**Team:** SAU-0226-Team 9

**Project Name:** Zumrah

## 1. Project Objectives

**Purpose:**

To bring together communication and resource sharing for King Saud University (KSU) students stopping the use of scattered, unverified and unorganized WhatsApp groups.

**SMART Objectives:**

1. **Create a working PWA MVP** with verified Microsoft OAuth login and real-time chat rooms by the end of the development phase.
2. **Build an Admin Portal** that lets administrators manage university structure (courses/majors) check reported chat messages and approve or reject student-uploaded files to make sure the platform is properly managed.
3. **Make real-time communication work** by using SignalR WebSocket.

## 2. Roles

**Stakeholders:**

*   **Internal:** Team members (Basem, Mohammed, Ahmed, Ali).
*   **External:** End-users (Students in the College of Information and Computer Science at KSU).

**Team Roles:**

*   **Basem** (Project Manager & Backend Developer)
*   **Mohammed** (Backend Developer)
*   **Ahmed** (Frontend Developer)
*   **Ali** (Frontend Developer)

## 3. Project Scope

**In-Scope:**

*   Login for verified KSU students using Microsoft OAuth (`@student.ksu.edu.sa`).
*   Self-service enrollment process based on major and level.
*   Real-time, WebSocket-powered course chat rooms (SignalR).
*   A centralized file storage system for course materials.
*   A comprehensive Admin Portal to manage courses, audit chats, and approve files.
*   A friendly Progressive Web App (PWA) that can be added to the home screen.

**Out-of-Scope:**

*   Apps for the Apple App Store or Google Play.
*   Tutor or teacher accounts and ads on the platform.

## 4. Risks and Mitigation Strategies

| Risk | Mitigation Strategy |
| :--- | :--- |
| **Technical:** SignalR connections might drop on mobile devices when switching networks or when the PWA is woken up. | Spend time at the start of the project watching SignalR tutorials reading Microsofts guides and building small test chats to learn faster. |
| **Time/Scope:** Making a full Admin Portal from scratch will take a lot of time. | Focus on the MVP. We will make a unstyled admin dashboard first to manage file approvals and only spend time on making it look better if we finish the main app early. |
| **Data Acquisition:** Manually entering all KSU colleges, majors and courses into our database is hard, error-prone, and takes too long. | Contact developers of KSU platforms to see how they get data (like web scraping or hidden APIs). As a fallback, we will restrict the MVP scope exclusively to the College of Information and Computer Science to minimize manual data entry. |

## 5. High-Level Project Plan

*   **Week 1: Stage 1 – Team Formation and Idea Development** *(Completed)*
*   *Milestone:* Team roles set, brainstorming done and the Zumrah MVP idea chosen.
*   **Week 2: Stage 2 – Project Charter Development** *(Current...)*
*   *Milestone:* Objectives, roles, scope, risks and the project plan set.
*   **Weeks 3–4: Stage 3 – Technical Documentation**
*   *Milestone:* System layout, database setup, API details and UI sketches.
*   **Weeks 5–10: Stage 4 – MVP Development**
*   *Milestone:* Backend APIs, OAuth login, SignalR chats, admin features, and React PWA client built and connected.
*   **Weeks 11–13: Stages 4 & 5 – Advanced Testing, Refinement & Project Closure**
*   *Milestone:* All parts tested together, bugs fixed, final presentation.
