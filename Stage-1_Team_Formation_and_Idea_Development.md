## Team Formation
*   **Roles:** Basem (Project Manager & Backend), Mohammed (Backend), Ahmed (Frontend), Ali (Frontend).
*   **Norms:** Discord is used for coordination, and WhatsApp for urgent updates.

## Research and Brainstorming
We looked into student problems and local market issues using a "How Might We" approach to find gaps in campus teamwork.

## Idea Evaluation
*Evaluation Criteria:* How well the idea fits our tech, how much it costs, how big it is and its possible impact.
*   **Idea 1: Context-Aware Course Material AI**
    *   *Strengths:* High student demand.
    *   *Weaknesses/Rejection Reason:* It is not technically complex because it uses third‑party API wrappers and the cost of API tokens is too high for document contexts.
*   **Idea 2: Entertainment Booking Platform**
    *   *Strengths:* Addresses local sports and entertainment scheduling issues.
    *   *Weaknesses/Rejection Reason:* The scope grows too large because of vendor and booking rules and it is too broad for a focused MVP timeline.

## Decision and Refinement
*   **Selected MVP:** KSU Digital Campus.
*   **The Problem:** Campus messages are spread over WhatsApp and Telegram groups. Files disappear, public links bring spam, and group control is chaotic during add/drop periods.
*   **Target Audience:** King Saud University students.
*   **Key Features & Expected Outcomes:**
    *   *Verified Login:* Microsoft OAuth is limited to `@student.ksu.edu.sa` addresses.
    *   *Mobile-First PWA:* An installable web app that shows users chat hubs and course materials.
    *   *Self-Service Enrollment:* Users can search for courses to join or drop chats.
    *   *Real-Time Chats:* Discussion rooms powered by WebSocket (SignalR).
    *   *Curated Resource Vault:* Files are stored in Azure Blob Storage. Need admin approval to stop piracy.

## Idea Development Documentation
*   **Process Overview:** We set roles by strengths and checked ideas against tech and money limits.
*   **MVP Summary & Rationale:** KSU Digital Campus connects teamwork with organized academic storage. It was chosen because it matches our tech stack (ASP.NET Core, React, MySQL) is very doable and costs nearly nothing.
*   **Potential Impact:** It will replace scattered, social groups with a safe central academic hub.
*   **Challenges & Constraints:** We must keep SignalR WebSocket links stable when users switch networks and we must handle admin file review delays during busy exam times.