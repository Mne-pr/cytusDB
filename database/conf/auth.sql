# 권한 설정
grant all privileges on  *.* to 'root'@'%' identified by 'Wjdxhd12!@';
delete from mysql.user where host="localhost" and user="root";

# root와 manager 패스워드 다르게 설정할 것
# 매니저
CREATE USER 'manager'@'%' identified by 'manage12!@';
grant all privileges on  cytus2DB.* to 'manager'@'%';

#웹메니저
CREATE USER 'webadmin'@'%' identified by 'webmanager12!@';
grant all privileges on  cytus2DB.* to 'webadmin'@'%';

flush privileges;
select host,user,plugin,authentication_string from mysql.user;