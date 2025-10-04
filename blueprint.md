# Project Blueprint: "First Click" Real-Time Game

## 1. Overview

This document outlines the development plan for a real-time web application designed for interactive classroom activities. The core functionality allows a group of users to "buzz in" by clicking a button, with an admin view that displays the winner in real-time, ranked by who clicked first with millisecond precision.

The application will be built using **React** for the user interface and **Google Firebase** (specifically, Firestore) for the real-time backend, data storage, and game state management.

## 2. Core Features & User Journeys

### User Roles
*   **Participant:** A student or user who joins a session to participate.
*   **Admin:** The teacher or session host who controls the game and views the results.

### Feature Breakdown
1.  **Session Joining:**
    *   Participants navigate to a page where they can enter their name and join the session.
    *   Upon joining, they are taken to a waiting screen.
2.  **Game Control (Admin):**
    *   The admin has a dedicated dashboard.
    *   The admin can "enable" the "Press Now" button for all participants.
    *   The admin can "reset" the game, clearing the current results and preparing for a new round.
    *   The admin can see a list of connected participants.
    *   The admin can remove a participant from the session.
3.  **Real-Time "Buzz-In":**
    *   When the admin enables the button, it appears for all participants.
    *   Participants click the "Press Now" button.
    *   The first participant to click is registered as the winner.
4.  **Real-Time Results (Admin):**
    *   The admin dashboard instantly displays a ranked list of participants who clicked the button.
    *   The list shows the participant's name and the timestamp of their click.
    *   The winner is clearly highlighted.

## 3. Technical Design & Implementation Plan

### Technology Stack
*   **Frontend:** React (with Vite)
*   **Backend & Database:** Google Firebase (Firestore)
*   **Routing:** `react-router-dom`
*   **Styling:** Modern CSS with a focus on a clean, intuitive, and mobile-responsive design.

### Data Model (Firestore)
We will use a single collection called `sessions`. For simplicity, we'll start with a single, hardcoded session document (e.g., `default-session`).

**`sessions/default-session`**
```
{
  "buttonEnabled": false,
  "sessionLocked": false, 
  "enabledTimestamp": null, 
  "participants": {
    "participant_id_1": {
        "name": "Alice",
        "team": "alpha",
        "disabled": false 
    },
  },
  "clicks": {
    "participant_id_1": 1678886400123,
  },
  "scores": {
      "alpha": 0,
      "omega": 0
  }
}
```

## 4. Phase 1-3: Initial Implementation (Completed)

This phase covered the setup of the project, basic routing, core feature implementation (joining, buzzing-in, admin controls), and initial styling.

## 5. Phase 4: Advanced Features & UI Overhaul (Completed)

This phase covered advanced features like disabling and removing participants, locking the session, and a major UI overhaul of the admin panel.

## 6. Phase 5: Team-Based Gameplay (Current Phase)

### Feature Enhancements

1.  **Team Selection:**
    *   The `JoinPage` will be updated to include team selection. Users will choose between "Team Alpha" and "Team Omega".
2.  **Admin Panel Score Management:**
    *   The `AdminPage` will display the scores for Team Alpha and Team Omega.
    *   The admin will have controls (+ and - buttons) to manually adjust the scores.
    *   Scores will be visualized using a bar chart for a quick graphical overview.
    *   A prominent message will indicate which team is currently in the lead.
3.  **Team-Based Results:**
    *   The buzzer list in the admin panel will show the team of the participant who buzzed in.

### Development Steps

1.  **Update `JoinPage.jsx`:** Add UI for team selection and update the join logic to include the team information in Firestore.
2.  **Update `AdminPage.jsx`:**
    *   Fetch and display team scores.
    *   Implement score adjustment functionality.
    *   Integrate a chart library (e.g., `react-chartjs-2`) to visualize scores.
    *   Display the team name in the buzzer list.
    *   Add a UI element to show the leading team.
3.  **Update `src/pages/admin/Admin.css`:** Add styling for the new leading team indicator.
4.  **Update Firestore Rules:** Ensure that only admins can update the scores.
5.  **Install Charting Library:** Run `npm install react-chartjs-2 chart.js`.
