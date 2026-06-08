# Phase 3 Implementation Report — Academic ERP Core

**Project:** Campus Connect ERP  
**Phase:** 3 of 5  
**Status:** ✅ Complete  
**Completed:** 2026-06-08  
**Git Commit:** `feat: implement phase 3 - academic core (timetable, attendance, marks, notifications, leaves, fees)`

---

## 1. Files Created

| File | Purpose |
|---|---|
| `backend/src/models/TimetableSlot.js` | Timetable Slot Mongoose schema (class scheduling cells) |
| `backend/src/models/Attendance.js` | Attendance tracking Mongoose schema (presence logs) |
| `backend/src/models/Mark.js` | Academic Marks/Grades Mongoose schema (report cards) |
| `backend/src/models/Notification.js` | System Announcements/Notifications Mongoose schema (alerts board) |
| `backend/src/models/LeaveRequest.js` | Leave Requests Mongoose schema (leaves booking logs) |
| `backend/src/models/Invoice.js` | Invoice Ledger Mongoose schema (tuition fees billing cards) |
| `backend/src/controllers/timetableController.js` | Timetable Slot CRUD and role filter logic |
| `backend/src/controllers/attendanceController.js` | Attendance logs entry, class check, and summary calculations |
| `backend/src/controllers/marksController.js` | Student marks retrieval and bulk-entry grade updates |
| `backend/src/controllers/notificationsController.js` | Broadcast announcements, target audience filtering, and read tracking |
| `backend/src/controllers/leaveController.js` | Leave application filing and approval reviews |
| `backend/src/controllers/feeController.js` | Invoice generation, retrieval, and payment processing |
| `backend/src/routes/timetable.js` | Routes for class schedule boards |
| `backend/src/routes/attendance.js` | Routes for attendance sheets |
| `backend/src/routes/marks.js` | Routes for exams and grades cards |
| `backend/src/routes/notifications.js` | Routes for alert bulletins |
| `backend/src/routes/leaves.js` | Routes for student leave forms |
| `backend/src/routes/fees.js` | Routes for payment invoice pages |

---

## 2. Files Modified

| File | Change |
|---|---|
| `backend/src/app.js` | Imported and mounted 6 new academic route controllers under `/api/*` prefixes |

---

## 3. Models Created

### TimetableSlot (`timetableslots` collection)
* `subject` (String, required)
* `code` (String, optional)
* `facultyId` (ObjectId → Faculty, required)
* `day` (String, enum: Monday-Sunday, required)
* `startTime` (String, required)
* `endTime` (String, required)
* `room` (String, required)
* `branch` (String, required, uppercase)
* `section` (String, required, uppercase)
* `year` (Number, 1-4, required)
* `semester` (Number, 1-8, required)
* **Indexes**: Compounds `{ branch: 1, section: 1, year: 1, semester: 1, day: 1 }` and `{ facultyId: 1, day: 1 }`

### Attendance (`attendances` collection)
* `studentId` (ObjectId → Student, required)
* `timetableSlotId` (ObjectId → TimetableSlot, optional)
* `subject` (String, required)
* `date` (Date, required)
* `status` (String, enum: Present/Absent/Late, default: Present)
* `markedBy` (ObjectId → User, required)
* `remarks` (String, optional)
* **Index**: `{ studentId: 1, subject: 1, date: 1 }` (unique) to prevent duplicate marks

### Mark (`marks` collection)
* `studentId` (ObjectId → Student, required)
* `subject` (String, required)
* `examType` (String, enum: Internal 1/Internal 2/Assignment/Semester, required)
* `marksObtained` (Number, required)
* `maxMarks` (Number, default: 100)
* `remarks` (String, optional)
* **Index**: `{ studentId: 1, subject: 1, examType: 1 }` (unique) to prevent double entry

### Notification (`notifications` collection)
* `senderId` (ObjectId → User, required)
* `recipientRoles` (Array of Strings: student/faculty/parent/admin)
* `recipientIds` (Array of ObjectId → User)
* `title` (String, required)
* `message` (String, required)
* `type` (String, enum: academic/fee/general/alert)
* `readBy` (Array of ObjectId → User)

### LeaveRequest (`leaverequests` collection)
* `studentId` (ObjectId → Student, required)
* `startDate` (Date, required)
* `endDate` (Date, required)
* `reason` (String, required)
* `status` (String, enum: Pending/Approved/Rejected, default: Pending)
* `approvedBy` (ObjectId → User, optional)
* `remarks` (String, optional)

### Invoice (`invoices` collection)
* `studentId` (ObjectId → Student, required)
* `title` (String, required)
* `amount` (Number, required)
* `dueDate` (Date, required)
* `status` (String, enum: Paid/Unpaid/Overdue, default: Unpaid)
* `paymentDate` (Date, optional)
* `paymentMethod` (String, optional)
* `transactionId` (String, optional)

---

## 4. API Endpoints Implemented

### Timetable (`/api/timetable`)
* `GET /` — Retrieve timetable matching authenticated role profiles and filters.
* `POST /` — Create a timetable slot cell (Admin only).
* `PUT /:id` — Modify a timetable slot cell (Admin only).
* `DELETE /:id` — Remove a timetable slot cell (Admin only).

### Attendance (`/api/attendance`)
* `GET /student/:studentId` — Fetch detailed logs for a student (Self, Parent, Faculty, Admin).
* `GET /summary/:studentId` — Compute overall and subject-wise attendance metrics/percentages.
* `GET /class` — Fetch attendance records for a class on a date (Faculty, Admin).
* `POST /mark` — Record student attendance in bulk (Faculty, Admin).

### Marks (`/api/marks`)
* `GET /student/:studentId` — Fetch grade cards (Self, Parent, Faculty, Admin).
* `GET /class` — Fetch mark lists for a class subject (Faculty, Admin).
* `POST /update` — Log student grades in bulk (Faculty, Admin).

### Notifications (`/api/notifications`)
* `GET /` — Fetch notifications inbox filtering by user role or direct matching ID.
* `POST /` — Publish announcements (Faculty, Admin).
* `PUT /:id/read` — Mark a notification as read (Recipients only).

### Leaves (`/api/leaves`)
* `GET /` — Query leave filings with role permissions.
* `POST /` — Apply for a leave request (Student only).
* `PUT /:id` — Review, approve, or reject leave request (Faculty, Admin).

### Fees (`/api/fees`)
* `GET /student/:studentId` — Fetch invoices ledger (Student, Parent, Admin).
* `POST /` — Generate fee invoice billing record (Admin only).
* `POST /pay/:invoiceId` — Pay fee invoice using simulated transaction inputs (Parent only).

---

## 5. Build & Verification Status

* **Server Build Status**: ✅ Running stably on port 5000 with MongoDB connected.
* **Access Control Verification**: ✅ Verified 18/18 endpoints return `401 Unauthorized` when requested without tokens.
* **Mongoose Integration Verification**: ✅ Tested user creations, models setup, populates, index lookups, and compound constraints. All database operations passed successfully.

---

## 6. Remaining Work Before Phase 4

* **Spreadsheet file uploads**: Multer storage & import routes (Phase 4).
* **AI Chatbot Integration**: Chatbot message routes & Gemini Flash API setup (Phase 4).
* **Frontend Wiring**: Hooking UI views to query endpoints (Phase 5).
