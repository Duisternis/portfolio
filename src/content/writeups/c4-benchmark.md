---
title: c4 diagrams, redrawn
date: 2026-09-13
summary: three diagrams from the c4-plantuml examples, drawn by the sketch engine
draft: false
---

Three diagrams from the C4-PlantUML example set, redrawn by the sketch engine that
renders every diagram on this site. The test was to reproduce them rather than to pick
the parts that happened to be easy: every element keeps its name, its type, its
technology and its full description, and every relation keeps both lines of its label.

What changed is the vocabulary. C4 specifies its own palette; this site has its own, and
a foreign palette on a themed page reads as a foreign object. So each mark is translated
to the nearest one here. The facts survive, the marks do not.

| c4 | here |
| --- | --- |
| blue fill, internal container | the default box |
| grey fill, outside the boundary | `tone=muted` |
| eight sided, tagged container | the same shape, plus the accent border |
| cylinder, datastore | the same cylinder |
| person outline | the same outline |
| dashed line, async | the same dashed line |
| dotted line, sync/async | the same dotted line |

Click any diagram to open it full screen; drag to pan, scroll to zoom.

## container diagram: internet banking

Eight elements, a system boundary, ten relations, three shapes, three line styles.

```sketch internet banking system
group Internet Banking : Web Application, Single-Page App, Mobile App, Database, API Application

box Customer at 40,3 size 32x7 shape=person align=center : [Person] | A customer of the bank, with personal bank accounts

box E-Mail System at 120,3 size 32x7 align=center tone=muted : [Software System] | The internal Microsoft Exchange system

box Web Application at 0,18 size 32x8 align=center : [Container: Java, Spring MVC] | Delivers the static content and the Internet banking SPA

box Single-Page App at 40,18 size 32x8 align=center : [Container: JavaScript, Angular] | Provides all the Internet banking functionality to customers via their web browser

box Mobile App at 80,18 size 32x8 align=center : [Container: C#, Xamarin] | Provides a limited subset of the Internet banking functionality to customers via their mobile device

box API Application at 40,33 size 32x8 shape=hex align=center tone=focus : [Container: Java, Docker Container] | Provides Internet banking functionality via API

box Database at 0,33 size 32x8 shape=db align=center : [Container: SQL Database] | Stores user registration information, hashed auth credentials, access logs, etc.

box Mainframe Banking System at 40,48 size 32x8 align=center tone=muted : [Software System] | Stores all of the core banking information about customers, accounts, transactions, etc.

Customer -> Web Application : Uses | [HTTPS]
Customer -> Single-Page App : Uses | [HTTPS]
Customer -> Mobile App : Uses
Web Application -> Single-Page App above : Delivers
Single-Page App --> API Application : Uses | [async, JSON/HTTPS]
Mobile App --> API Application : Uses | [async, JSON/HTTPS]
Database <- API Application above : Reads from and writes to | [sync, JDBC]
Customer <- E-Mail System : Sends e-mails to
E-Mail System@bottom <- API Application@right : Sends e-mails using | [sync, SMTP]
API Application -> Mainframe Banking System dotted : Uses | [sync/async, XML/HTTPS]

legend focus : the container under discussion
legend muted : outside the system boundary
legend dashed : async
legend dotted : sync/async
```

## container diagram: techtribes.js

Three kinds of user, five containers inside one boundary, three external systems,
twelve relations. The interesting part is the updater, which writes to all three stores
and reads from three systems it does not own.

```sketch techtribes.js
group techtribes.js : Web Application, Relational Database, File System, NoSQL Data Store, Updater

box Anonymous User at 0,0 size 32x4 shape=person align=center tone=muted : [Person]
box Aggregated User at 40,0 size 32x4 shape=person align=center : [Person]
box Administration User at 80,0 size 32x4 shape=person align=center : [Person]

box Web Application at 40,10 size 32x9 align=center : [Container: Java, Spring MVC, Tomcat 7.x] | Allows users to view people, tribes, content, events, jobs, etc. from the local tech, digital and IT sector

box Relational Database at 0,24 size 32x7 shape=db align=center : [Container: MySQL 5.5.x] | Stores people, tribes, tribe membership, talks, events, jobs, badges, GitHub repos, etc.
box File System at 40,24 size 32x7 align=center : [Container: FAT32] | Stores search indexes
box NoSQL Data Store at 80,24 size 32x7 shape=db align=center : [Container: MongoDB 2.2.x] | Stores from RSS/Atom feeds (blog posts) and tweets

box Updater at 40,36 size 32x7 align=center : [Container: Java 7 Console App] | Updates profiles, tweets, GitHub repos and content on a scheduled basis

box Twitter at 0,48 size 32x4 align=center tone=muted : [Software System]
box GitHub at 40,48 size 32x4 align=center tone=muted : [Software System]
box Blogs at 80,48 size 32x4 align=center tone=muted : [Software System]

Anonymous User -> Web Application : Uses | [HTTPS]
Aggregated User -> Web Application : Uses | [HTTPS]
Administration User -> Web Application : Uses | [HTTPS]

Web Application -> Relational Database : Reads from and writes to | [SQL/JDBC, port 3306]
Web Application -> File System : Reads from
Web Application -> NoSQL Data Store : Reads from | [MongoDB wire protocol, port 27017]

Updater -> Relational Database : Reads from and writes data to | [SQL/JDBC, port 3306]
Updater -> File System : Writes to
Updater -> NoSQL Data Store : Reads from and writes to | [MongoDB wire protocol, port 27017]

Updater -> Twitter : Gets profile information and tweets from | [HTTPS]
Updater -> GitHub below : Gets information about public code repositories from | [HTTPS]
Updater -> Blogs : Gets content using RSS and Atom feeds from | [HTTP]

legend muted : outside the system boundary
```

## sequence diagram: authentication

A different notation entirely. There are no sequence primitives in the engine; this is
lifelines, activation, fragments and dividers drawn out of lines, closed paths and text,
the same pieces any other diagram uses.

Regions are dashed, like the boundary in the diagrams above, and carry their name in the
top left rather than in a tab. A `ref` is a solid box, because it holds content and sits
on a lifeline. Messages are in the text colour and everything structural is dim, so the
exchange reads before its scaffolding does.

This is also the one diagram where the text changed: `Authentication Request` reads
`Auth Request`, because a sequence diagram is read across rather than down and the full
names crowd the lifelines.

```sketch authentication
align center

box Alice at 0,0 size 20x4 shape=person align=center : [Person]
box Bob at 50,0 size 20x4 shape=person align=center : [Person]

line 10,4 > 10,54 dotted
line 60,4 > 60,54 dotted
path 59.5,7 > 60.5,7 > 60.5,53 > 59.5,53 filled

text 12,6 : Auth Request
line 10,7 > 59,7 arrow

path 4,9 > 66,9 > 66,21 > 4,21 dashed closed
path 4,9 > 27,9 > 27,10 > 4,10 mask
text 5,9 meta : alt [successful case]

text 13,11 : Auth Accepted
line 59,12 > 11,12 arrow

line 4,14 > 66,14 dashed
path 4,14 > 28,14 > 28,15 > 4,15 mask
text 5,14 meta : [some kind of failure]

path 8,16 > 62,16 > 62,20 > 8,20 dashed closed
path 8,16 > 25,16 > 25,17 > 8,17 mask
text 9,16 meta : loop 1000 times

text 13,18 : DNS Attack
line 10,19 > 59,19 arrow

path 4,22.5 > 66,22.5 > 66,24.5 > 4,24.5 filled
text 5,23 : ref:
text 10,23 meta : init

text 13,26 : hello
line 10,27 > 59,27 arrow

path 46,28.5 > 66,28.5 > 66,33 > 46,33 filled
text 47,29 : ref
text 47,30.5 meta : This can be on
text 47,31.5 meta : several lines

line 0,34.5 > 27,34.5 dashed
text 27,34 meta : [initialization]
line 43,34.5 > 70,34.5 dashed

text 13,36 : Auth Request
line 10,37 > 59,37 arrow

text 13,39 : Auth Response
line 59,40 > 11,40 arrow

line 0,42.5 > 29,42.5 dashed
text 29,42 meta : [repetition]
line 41,42.5 > 70,42.5 dashed

text 13,44 : Another Auth Request
line 10,45 > 59,45 arrow

text 13,47 : another Auth Response
line 59,48 > 11,48 arrow

text 26,50 meta : 5 minutes later

text 13,52 : calls via phone
line 10,53 > 59,53 arrow
```

## what it does not do

One thing, and it is not small: layout. PlantUML is given a list of elements and
relations and works out where everything goes. Every coordinate in all three diagrams
above was typed by hand.

That is also what stands between these and a translator that reads a C4 file and emits
one of these directly. The vocabulary maps cleanly; the placement does not map at all.

The grammar behind all three is written up in [diagrams as code](/writeups/diagrams-as-code).
