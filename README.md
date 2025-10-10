# City Park Authority Dashboard Frontend

## Overview

This is the repository for the [Dashboard Frontend](https://cpmdashboard.com/dashboard) for City Park Authority. This application lets parking lot owners see their lot's activity, it also lets admins see and manage parking violations, set unenforcable days and permits for specific parking lots, and be contacted by lot owners for requests regarding their lot.

## Implementation

### Tech Stack

* TypeScript
* React
* Mui
* Axios
* Firebase
* React Redux
* React Toastify
* QRCode.React
* TailwindCSS

### Data

The data utilized in this application is collected by City Park Authority's License Plate Recognition system, which collects key information about each entry and exit to the parking lot. The dashboard accesses this data via a City Park Authority's backend server.

### Auth

This dashboard functions with a user log-in system. The information presented to each user depends on if their profile is one of a lot owner or an admin. The app utilizes standard email account creation as well as google O-Auth.

### Pages

This dashboard includes 7 separate pages for Admin users:

* Dashboard: showcases a monthly timeline of parking sessions and violations, a graph viewer of total commission, paid out money, and profits, and a table listing entries and exits per lot/vehicle.

* User Management: showcases a table of current users, admins can give and remove privileges for each user.

* My Lots: lists all the parking lots in the system. Within each lot, admins can adjust lot information such as address, rates, and pay time. They can also connect to the anydesk address to manage each of the lot's systems directly.

* Parking Sessions: displays a table showcasing parking sessions in multiple ways:
  * LPR Sessions
  * Paid Sessions
  * Non-Violations
  * Violations
  * Error

* Permits: lets admins give exception permits to specific people/license plates on specific parking lots in the system.

* Unenforcable Dates: lets admins set unenforcable dates on specific lots (Dates where the system won't take into account missed payments).

* Inbox: shows any messages end users might send through the app's messaging system to admins.

### Endpoints

* /lot
   * get - returns parking lots in the system
   * post - creates new parking lot in the system
* /data - returns data for a specific lot
* /user - returns current user data
  * /end-users - returns end users for a lot
  * delete - deletes user by uid
* /message
  * get - returns messages
  * delete - deletes message by ID
* /zone - returns enforcement zone
* /location - returns lot location
* /payment - returns paid session data
* /payment-app - returns paid session data
* /permit
  * post - creates new permit
  * delete - deletes permit by ID
  * get - gets all permits
