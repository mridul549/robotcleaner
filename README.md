
# RoboCleaner

The "Automated Cleaning Scheduler with Notifications" project aims to provide an automated system for scheduling the weekly cleaning of a robot, with additional functionality to send push notifications to operators as reminders. 

# Tech Stack

The project utilizes the following technologies:
- MongoDB 
- Firebase 
- Express.js
- Node.js
- Redis
- OAuth2
- Nodemailer
- Github Agenda

# Features:

The project includes the following primary features.

### User authentication
The system includes a user authentication mechanism, allowing operators to log in securely.

- Token based authentication has been implemented using JWT(JSON Web Tokens).
- Passwords are encrypted using bcrypt library.
- OTP based user verification has also been added, where on Sign up the OTPs are sent on the registered email. This has been implemented using Redis, GMail API (OAuth2), and Nodemailer.

### Cleaning Schedule:

- Utilizes MongoDB as primary database to store user profiles and cleaning schedules.
- Users have the flexibility to set cleaning frequencies for each day of the week, choosing between once or twice a day and specifying different times.
- The system allows users to update their scheduled cleaning times, providing flexibility and convenience.
- The scheduling has been implemented using a library Github Agenda. (Why I have used Github Agenda instead of node-cron or node-schedule has been explained below)

### Push Notifications:

- Integrates Firebase Push Notification to send timely reminders to operators.
- Notifications include relevant details such as the scheduled cleaning time and date, enhancing the user experience and ensuring operators are well-informed.
- Also implemented a basic Flutter app for the testing of the same. Demo can be seen in this video: https://github.com/mridul549/robotcleaner/assets/94969636/ba8ee8ff-3043-4459-8005-138de72b7183
- Notification- 
<img style="display: inline; width: 50%" width="372" alt="Screenshot 2023-11-13 at 2 36 30 PM" src="https://github.com/mridul549/robotcleaner/assets/94969636/70aebf5b-a8bc-43a0-9a34-6a51ada2c966"> 

### Error Handling:

- Implements robust error handling mechanisms to address scenarios like invalid preferences and scheduling conflicts.
- Ensures a seamless user experience by providing meaningful error messages and preventing data inconsistencies.
- Some error handling examples are:
    - The time given for scheduling is not in the required format of HH:MM.
    - The date given for scheduling is not in the required format of YYYY-MM-DD.
    - User tries to set the frequency greater than 2 for a day.
    - No date or time from the past can be scheduled. (Eg. If today is 13th Nov, 2023 02:30 PM, then you can't schedule a task for 12th Nov, 2023 or a time before 02:30 PM).

### Documentation:
- Postman Collection: https://warped-shuttle-621293.postman.co/workspace/Team-Workspace~377b815e-3199-4e51-897f-afc0155f55b1/collection/21883208-11a90c12-e362-4459-8880-c36d3f921dbf?action=share&creator=21883208
- Postman Published Documentation: https://documenter.getpostman.com/view/21883208/2s9YXk4gqu

# FAQ

**Q. Why have I used Redis?** \
**A.** The GMail API (at least the free version) has a cap on the maximum number of concurrent emails that can be sent at a time (the number is 100). In order to avoid this scenario, I've implemented a queue in the backend, which limits the number of concurrent requests to just 80. This queue has been implemented using the Bull library which uses Redis as it's persistent data store.

**Q. Why I have used Github Agenda instead of node-cron or node-schedule?** \
**A.** Node-cron and node-schedule also did the job of scheduling the cleaning jobs perfectly, but they had several drawbacks, some of them are:
- **It's difficult to track a job or Modify a job once scheduled on the system.** If a user decides to update the time of a job, it would become a task to cancel/modify the previously scheduled job.
- **If the server faces a crash or restart for some reason, the previously scheduled jobs are lost.** To tackle this situation, you need to store the jobs in a persistent storage system so that they can be dealt with again on crashes or restarts.

**The solution to both the problems was provided by the library called Github Agenda**, which not only stores the job in a persistent storage (MongoDB) but also lets you track/modify a job using a unique id later.

I've stored a jobID (or cronID) in the database when a job is scheduled by a user. If a user wishes to modify it later, the task can be easily done.

Although the same task could be implemented by the Bull queue, but complexity of implementing the same was quite more as compared to Agenda.
