# EduBloom Test Cases

## 1. Authentication and Common Features

| Scenario ID | Scenario Description | Pre Condition | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC_AUTH_01 | Verify successful login with Student credentials | Student account exists. | 1. Enter valid student email & password.<br>2. Click Login. | Redirected to `/student/dashboard.html`. | | |
| TC_AUTH_02 | Verify successful login with Teacher credentials | Teacher account exists. | 1. Enter valid teacher email & password.<br>2. Click Login. | Redirected to `/teacher/dashboard.html`. | | |
| TC_AUTH_03 | Verify successful login with Parent credentials | Parent account exists. | 1. Enter valid parent email & password.<br>2. Click Login. | Redirected to `/parent/dashboard.html`. | | |
| TC_AUTH_04 | Verify successful login with Admin credentials | Admin account exists. | 1. Enter valid admin email & password.<br>2. Click Login. | Redirected to `/admin/dashboard.html`. | | |
| TC_AUTH_05 | Verify login attempt with invalid email format | User is on login page. | 1. Enter `testuser` without domain.<br>2. Click Login. | Warning message "Please enter a valid email" is shown. | | |
| TC_AUTH_06 | Verify login attempt with unregistered email | User is on login page. | 1. Enter an email not in database.<br>2. Click Login. | "Invalid credentials" error is shown. | | |
| TC_AUTH_07 | Verify login attempt with incorrect password | User account exists. | 1. Enter valid email but wrong password.<br>2. Click Login. | "Invalid credentials" error is shown. | | |
| TC_AUTH_08 | Verify login fields validation for empty values | User is on login page. | 1. Leave email/password blank.<br>2. Click Login. | Prompt highlighting required fields is displayed. | | |
| TC_AUTH_09 | Verify SQL injection payload in login fields | User is on login page. | 1. Enter payload like `' OR 1=1 --` in fields.<br>2. Click Login. | System securely rejects the input without backend crash. | | |
| TC_AUTH_10 | Verify protected route redirection | User is NOT logged in. | 1. Attempt to directly visit `/student/dashboard.html`. | User is denied access and redirected to the `/login.html` page. | | |
| TC_AUTH_11 | Verify session expiry | User is logged in. | 1. Wait for token expiration time.<br>2. Perform any authenticated action. | Forced logout and redirect back to login page. | | |
| TC_AUTH_12 | Verify successful logout | User is logged in. | 1. Click Profile icon.<br>2. Select Logout. | Storage tokens are successfully cleared and user is redirected to Login page. | | |

## 2. Student Dashboard

| Scenario ID | Scenario Description | Pre Condition | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC_STU_01 | Verify overview metrics load accurately | Logged in as Student. | 1. Navigate to dashboard index. | Upcoming tasks, recent marks, and brief pomodoro charts render correctly. | | |
| TC_STU_02 | Verify access to assigned Grade resources | Teacher has uploaded resources. | 1. Go to Resources tab. | Subject/Grade folders relevant to the student display correctly. | | |
| TC_STU_03 | Verify downloading a PDF resource | PDF resource exists. | 1. Open a Subject folder.<br>2. Click on a file icon. | The file successfully initiates download or opens in viewer. | | |
| TC_STU_04 | Verify starting the Pomodoro timer | Logged in as Student. | 1. Navigate to Pomodoro.<br>2. Set time to 25m.<br>3. Click Start. | Visual countdown begins reducing by 1s intervals. | | |
| TC_STU_05 | Verify pausing/resuming Pomodoro timer | Timer is running. | 1. Click Pause.<br>2. Wait.<br>3. Click Resume. | Countdown stops while paused and resumes from exact time seamlessly. | | |
| TC_STU_06 | Verify Pomodoro session logs accurately | Session completes logic. | 1. Let Pomodoro timer reach 0:00. | System triggers completion sound and logs session time in DB. | | |
| TC_STU_07 | Verify Progress tab displays task stats | Pomodoro/Tasks logged. | 1. Navigate to Progress tab. | Analytical charts and metrics actively fetch and show correct student totals. | | |
| TC_STU_08 | Verify adding a valid Diary entry | Logged in as Student. | 1. Navigate to Diary.<br>2. Type title and content.<br>3. Click Save. | Diary list updates to include the new entry seamlessly. | | |
| TC_STU_09 | Verify viewing past diary entries | Entries exist in DB. | 1. Click a past diary note title. | Modal or side-panel displays full content of the old entry. | | |
| TC_STU_10 | Verify attempting and submitting a Quiz | Quiz is open. | 1. Open Quiz.<br>2. Choose answers.<br>3. Click Submit. | Responses save and auto-evaluation immediately provides the final score. | | |
| TC_STU_11 | Verify adding a new Task in Calendar | Logged in as Student. | 1. Go to Calendar.<br>2. Create a "Study Biology" task.<br>3. Save. | Event pinops onto the correct date block in the Calendar UI. | | |
| TC_STU_12 | Verify posting in Resource Forum | Forum is active. | 1. Visit Forums.<br>2. Type "Need help with integration".<br>3. Submit. | Board refreshes showing the question and author name globally. | | |

## 3. Teacher Dashboard

| Scenario ID | Scenario Description | Pre Condition | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC_TCH_01 | Verify dashboard profile overview loads | Logged in as Teacher. | 1. Navigate to dashboard index. | Quick stats regarding uploaded modules and active forums load. | | |
| TC_TCH_02 | Verify creating a new Grade folder | Modulespace module. | 1. Navigate to Modulespace.<br>2. Add Grade 10.<br>3. Save. | A new dynamic grade space generates in folder view structure. | | |
| TC_TCH_03 | Verify creating a Subject inside a Grade | Grade folder exists. | 1. Open Grade 10.<br>2. Add "Science" subject.<br>3. Save. | Subject is nested exclusively under Grade 10 appropriately. | | |
| TC_TCH_04 | Verify uploading valid doc to Module Space | Subject folder open. | 1. Click Upload Document.<br>2. Pick `.pdf`.<br>3. Submit. | Backend accepts the data, associates it to subject, UI lists file. | | |
| TC_TCH_05 | Verify rejection of invalid file upload | Subject folder open. | 1. Upload `.exe` file. | UI declines upload stating explicitly allowed formats. | | |
| TC_TCH_06 | Verify deleting an uploaded resource | Resource exists. | 1. Click Delete option on a file.<br>2. Confirm. | File is unlinked, deleted from storage bucket, removed from viewport. | | |
| TC_TCH_07 | Verify creating a new Forum Topic | Logged in as Teacher. | 1. Go to Forums.<br>2. Add topic Title/Desc.<br>3. Click Create. | Forum table shows the created topic row with 0 replies. | | |
| TC_TCH_08 | Verify editing existing Forum Topic | Teacher owns Topic. | 1. Choose Edit on topic.<br>2. Append text.<br>3. Save. | Topic description safely updates matching latest text provided. | | |
| TC_TCH_09 | Verify deleting a Forum Topic without replies | Topic has 0 replies. | 1. Click Delete.<br>2. Approve modal. | Topic is definitively purged from system tracking tables. | | |
| TC_TCH_10 | Verify deleting Forum Topic WITH replies | Topic has >0 replies. | 1. Click Delete.<br>2. Accept prompt. | System intelligently overrides to ARCHIVE state rather than purge. | | |
| TC_TCH_11 | Verify creating a Quiz shell | Logged in as Teacher. | 1. Navigate to Quizzes.<br>2. Enter Quiz title and time-limit. | Blank quiz structure saves and routes to question builder. | | |
| TC_TCH_12 | Verify publishing Quiz module | Question builder view. | 1. Add questions.<br>2. Click Publish. | Flag turns active, immediately visible on student's relative list. | | |

## 4. Parent Dashboard

| Scenario ID | Scenario Description | Pre Condition | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC_PAR_01 | Verify Parent dashboard lists children | Assigned child in DB. | 1. Visit Dashboard index. | System resolves relationship ID and prints names of assigned kids. | | |
| TC_PAR_02 | Verify selecting child updates context | Context selector active. | 1. Top nav -> Select Child B. | State changes internally, refreshing view to Child B data. | | |
| TC_PAR_03 | Verify Progress tab maps Pomodoro data | Pomodoro logs present. | 1. Navigate to Progress tab.<br>2. Check metric cards. | Hours tracked and average focus time matches Child's local records. | | |
| TC_PAR_04 | Verify Progress tab maps Task data | Task logs present. | 1. Filter charts. | Chart shows "Completed vs Pending" exactly mirroring Child's DB values. | | |
| TC_PAR_05 | Verify filtering Progress by date range | Calendar plugin present. | 1. Pick "Last 7 days" view. | Graphs scale cleanly highlighting only the week bounds requested. | | |
| TC_PAR_06 | Verify Calendar presents scheduled tasks | Child has exams slated. | 1. Navigate to Parent Calendar. | View overlays exam/assessment blocks correctly mimicking child schedule. | | |
| TC_PAR_07 | Verify Parent UI enforces read-only access | Viewing Child tasks. | 1. Attempt to drag-and-drop or edit task block. | Interface deliberately blocks mutation operations for parent role. | | |
| TC_PAR_08 | Verify Context Switch refreshes Calendar | Multiple children. | 1. Switch drop-down from Child A to Child B. | Calendar immediately rerenders, flushing Child A items entirely. | | |
| TC_PAR_09 | Verify Resource overview lists folders | Child is in grade 8. | 1. Go to Resources tab. | Dashboard reveals Grade 8 active subjects / module syllabus items. | | |
| TC_PAR_10 | Verify Parent access boundaries | General interaction. | 1. Try to open and "Start" a Quiz from parent side. | View fails safely rejecting action due to mismatching permission array. | | |
| TC_PAR_11 | Verify UI response to completely empty data | Child is brand new. | 1. Navigate through all parent tabs holding empty selection. | System beautifully displays empty states "No Records Found" instead of crashing. | | |
| TC_PAR_12 | Verify viewing performance Marks | Exams graded. | 1. Visit Progress section.<br>2. Toggle Marks. | Tabular list or line graph presents consecutive test score grades. | | |

## 5. Admin Dashboard

| Scenario ID | Scenario Description | Pre Condition | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC_ADM_01 | Verify Admin dashboard loads metrics | Logged in as Admin. | 1. Visit index page. | Widget panes display aggregated data like total Users, total Storage. | | |
| TC_ADM_02 | Verify User Management list generation | DB has 50 users. | 1. Navigate to User Management. | Table accurately pages through exactly 50 total records holding distinct roles. | | |
| TC_ADM_03 | Verify User Management role filtration | Table loads. | 1. Pick filter "Teacher". | Data table narrows to strictly users matching the teacher clearance level. | | |
| TC_ADM_04 | Verify deactivating an active user | User is 'Active'. | 1. Click toggle on User ID 9.<br>2. Set 'Inactive'. | Flag alters securely in DB, halting their token generation during app login. | | |
| TC_ADM_05 | Verify reactivating a disabled user account | User is 'Inactive'. | 1. Change status back to 'Active'. | Privilege is restored; user achieves successful login immediately. | | |
| TC_ADM_06 | Verify creating a global system announcement | Logged in as Admin. | 1. Navigate to Announcements.<br>2. Type broadcast message.<br>3. Send. | Database catches broadcast model and applies to all respective user views. | | |
| TC_ADM_07 | Verify announcement appears on end-user app | Announcement is live. | 1. Log in as Student.<br>2. Inspect notification bar. | End user correctly spots the matching text sent by the administrator. | | |
| TC_ADM_08 | Verify deleting an active announcement | Announcement is live. | 1. Retract/Delete the announcement instance. | Re-logging in as a student verifies the text drops out of the notification feed. | | |
| TC_ADM_09 | Verify navigating to Forum Management | Forums exist. | 1. Visit Forum Moderation space. | Administrator gets universal global look at every topic without classroom restriction. | | |
| TC_ADM_10 | Verify Admin forcible deletion of Forum | Topic contains replies. | 1. Admin elects 'Force Delete'. | Standard rules are purposely bypassed, shredding all threads unconditionally for safety. | | |
| TC_ADM_11 | Verify Content Moderation flag listing | User reported a thread. | 1. Check Content Moderation queue. | Flagged items queue up predictably awaiting administrator review. | | |
| TC_ADM_12 | Verify Admin profile configuration edits | Admin account active. | 1. Visit Profile space.<br>2. Submit new Name string. | Details reflect seamlessly confirming standard CRUD forms are working for role string Admin. | | |
