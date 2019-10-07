# DATABASE CONFIGURATION
### Linux
* Install postgreSql database dependencies
<pre>
sudo apt install postgresql postgresql-contrib
</pre>
* Connect postgreSql database
<pre>
sudo -u postgres psql
</pre>
* Create Database
<pre>
CREATE DATABASE tabis_db;
</pre>
* Create Database User
<pre>
CREATE USER tabis_user WITH PASSWORD 'q';
</pre>
* Mach User to Database
<pre>
GRANT ALL PRIVILEGES ON DATABASE tabis_db TO tabis_user;
</pre>